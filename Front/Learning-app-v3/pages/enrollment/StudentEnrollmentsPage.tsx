import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  Badge,
  Progress,
  TextInput,
  Select,
  Grid,
  Avatar,
  ActionIcon,
  Tooltip,
  Tabs,
  Loader,
  Center,
  Alert
} from '@mantine/core';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import {
  IconSearch,
  IconEye,
  IconBook,
  IconClock,
  IconChecks,
  IconX,
  IconSchool,
  IconUser
} from '@tabler/icons-react';
import { enrollmentService, type StudentCourseEnrollmentDetail } from '../../services/enrollmentService';
import { getPendingValidationTicketsByCourse } from '../../services/miniProjectService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import sortBy from 'lodash/sortBy';
import { useNavigate } from 'react-router-dom';
import { IconCheckupList } from '@tabler/icons-react';

export default function StudentEnrollmentsPage() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<StudentCourseEnrollmentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<StudentCourseEnrollmentDetail>>({
    columnAccessor: 'enrollmentDate',
    direction: 'desc',
  });
  const [pendingTicketsCounts, setPendingTicketsCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enrollmentService.getAllEnrollments();
      setEnrollments(data);

      // Load pending tickets counts for each unique course
      const uniqueCourseIds = [...new Set(data.map(e => e.courseId))];
      const counts: Record<number, number> = {};

      for (const courseId of uniqueCourseIds) {
        try {
          const tickets = await getPendingValidationTicketsByCourse(courseId);
          counts[courseId] = tickets.length;
        } catch (err) {
          console.error(`Error loading pending tickets for course ${courseId}:`, err);
          counts[courseId] = 0;
        }
      }

      setPendingTicketsCounts(counts);
    } catch (err) {
      console.error('Error loading enrollments:', err);
      setError('Erreur lors du chargement des inscriptions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'blue';
      case 'completed':
        return 'green';
      case 'dropped':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'dropped':
        return 'Abandonné';
      default:
        return status;
    }
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch =
      search === '' ||
      enrollment.student?.firstName.toLowerCase().includes(search.toLowerCase()) ||
      enrollment.student?.lastName.toLowerCase().includes(search.toLowerCase()) ||
      enrollment.student?.email.toLowerCase().includes(search.toLowerCase()) ||
      enrollment.course?.title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort enrollments
  const sorted = sortBy(filteredEnrollments, sortStatus.columnAccessor as keyof StudentCourseEnrollmentDetail);
  const sortedData = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginatedData = sortedData.slice(from, to);

  // Stats
  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
  const droppedEnrollments = enrollments.filter(e => e.status === 'dropped').length;
  const totalStudents = new Set(enrollments.map(e => e.studentId)).size;
  const averageProgress =
    enrollments.filter(e => e.status === 'active').length > 0
      ? enrollments
          .filter(e => e.status === 'active')
          .reduce((acc, e) => acc + e.progressPercentage, 0) /
        enrollments.filter(e => e.status === 'active').length
      : 0;

  const columns = [
    {
      accessor: 'student',
      title: 'Étudiant',
      sortable: true,
      render: (enrollment: StudentCourseEnrollmentDetail) => (
        <Group gap="sm">
          <Avatar size="sm" color="blue" radius="xl">
            <IconUser size={16} />
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {enrollment.student?.firstName} {enrollment.student?.lastName}
            </Text>
            <Text size="xs" c="dimmed">
              {enrollment.student?.email}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      accessor: 'course',
      title: 'Cours',
      sortable: true,
      render: (enrollment: StudentCourseEnrollmentDetail) => (
        <div>
          <Text size="sm" fw={500} lineClamp={1}>
            {enrollment.course?.title}
          </Text>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {enrollment.course?.description}
          </Text>
        </div>
      ),
    },
    {
      accessor: 'enrollmentDate',
      title: 'Date d\'inscription',
      sortable: true,
      render: (enrollment: StudentCourseEnrollmentDetail) => (
        <Text size="sm">
          {format(new Date(enrollment.enrollmentDate), 'dd MMM yyyy', { locale: fr })}
        </Text>
      ),
    },
    {
      accessor: 'status',
      title: 'Statut',
      sortable: true,
      render: (enrollment: StudentCourseEnrollmentDetail) => (
        <Badge color={getStatusColor(enrollment.status)} variant="light">
          {getStatusLabel(enrollment.status)}
        </Badge>
      ),
    },
    {
      accessor: 'progressPercentage',
      title: 'Progression',
      sortable: true,
      render: (enrollment: StudentCourseEnrollmentDetail) => (
        <div style={{ width: 150 }}>
          <Group gap="xs" mb={4}>
            <Text size="xs" fw={600}>
              {enrollment.progressPercentage}%
            </Text>
          </Group>
          <Progress
            value={enrollment.progressPercentage}
            color={enrollment.progressPercentage === 100 ? 'green' : 'blue'}
            size="sm"
          />
        </div>
      ),
    },
    {
      accessor: 'actions',
      title: 'Actions',
      render: (enrollment: StudentCourseEnrollmentDetail) => (
        <Group gap="xs">
          <Tooltip label="Voir les détails">
            <ActionIcon variant="subtle" color="blue">
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Voir les tickets à valider">
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={() => navigate(`/validation?course=${enrollment.courseId}`)}
            >
              <IconCheckupList size={16} />
            </ActionIcon>
          </Tooltip>
          {pendingTicketsCounts[enrollment.courseId] > 0 && (
            <Badge color="red" variant="filled" size="lg">
              {pendingTicketsCounts[enrollment.courseId]}
            </Badge>
          )}
        </Group>
      ),
    },
  ];

  if (loading) {
    return (
      <Center style={{ minHeight: 400 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconX size={16} />} title="Erreur" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={2} mb="xs">
            Inscriptions des étudiants
          </Title>
          <Text c="dimmed">Gérez et suivez toutes les inscriptions aux cours</Text>
        </div>

        {/* Stats Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md" radius="md">
              <Group justify="apart">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Total inscriptions
                  </Text>
                  <Text size="xl" fw={700}>
                    {enrollments.length}
                  </Text>
                </div>
                <Avatar color="blue" size="lg" radius="md">
                  <IconBook size={24} />
                </Avatar>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md" radius="md">
              <Group justify="apart">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    En cours
                  </Text>
                  <Text size="xl" fw={700}>
                    {activeEnrollments}
                  </Text>
                </div>
                <Avatar color="blue" size="lg" radius="md">
                  <IconClock size={24} />
                </Avatar>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md" radius="md">
              <Group justify="apart">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Terminés
                  </Text>
                  <Text size="xl" fw={700}>
                    {completedEnrollments}
                  </Text>
                </div>
                <Avatar color="green" size="lg" radius="md">
                  <IconChecks size={24} />
                </Avatar>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder padding="md" radius="md">
              <Group justify="apart">
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Étudiants actifs
                  </Text>
                  <Text size="xl" fw={700}>
                    {totalStudents}
                  </Text>
                </div>
                <Avatar color="violet" size="lg" radius="md">
                  <IconSchool size={24} />
                </Avatar>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card withBorder padding="md" radius="md">
          <Group>
            <TextInput
              placeholder="Rechercher par nom, email ou cours..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filtrer par statut"
              data={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'active', label: 'En cours' },
                { value: 'completed', label: 'Terminés' },
                { value: 'dropped', label: 'Abandonnés' },
              ]}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || 'all')}
              style={{ width: 200 }}
            />
          </Group>
        </Card>

        {/* Data Table */}
        <Card withBorder padding="md" radius="md">
          <DataTable
            columns={columns}
            records={paginatedData}
            totalRecords={sortedData.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            highlightOnHover
            minHeight={400}
            noRecordsText="Aucune inscription trouvée"
          />
        </Card>

        {/* Page Size */}
        <Card withBorder padding="md" radius="md">
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Éléments par page:
            </Text>
            <Group gap="xs">
              {[10, 25, 50, 100].map((size) => (
                <ActionIcon
                  key={size}
                  variant={pageSize === size ? 'filled' : 'light'}
                  color="blue"
                  onClick={() => {
                    setPageSize(size);
                    setPage(1);
                  }}
                >
                  {size}
                </ActionIcon>
              ))}
            </Group>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
}
