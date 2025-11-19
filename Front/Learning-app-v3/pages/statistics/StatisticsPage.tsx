import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Group,
  RingProgress,
  ThemeIcon,
  Stack,
  Paper,
  SimpleGrid,
  Tabs,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconUsers,
  IconBook,
  IconTarget,
  IconTrendingUp,
  IconClock,
  IconCheckCircle,
  IconAlertCircle,
} from '@tabler/icons-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useGeneralStore } from '../../store/generalStore';

interface DashboardStats {
  totalUsers: number;
  activeCourses: number;
  miniProjects: number;
  validatedTickets: number;
}

interface ProgressionData {
  month: string;
  active: number;
  completed: number;
}

interface ActivityData {
  month: string;
  completions: number;
  incomplete: number;
}

interface PopularCourse {
  name: string;
  progress: number;
  color: string;
}

interface EnrollmentStats {
  totalEnrolled: number;
  completed: number;
  inProgress: number;
  notStarted: number;
}

interface TicketStats {
  total: number;
  validated: number;
  pending: number;
  rejected: number;
}

export const StatisticsPage: React.FC = () => {
  const { setBreadCrumb } = useGeneralStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progression, setProgression] = useState<ProgressionData[]>([]);
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [courses, setCourses] = useState<PopularCourse[]>([]);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null);
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);

  useEffect(() => {
    setBreadCrumb([
      { title: 'Dashboard', href: '/' },
      { title: 'Suivi et statistiques', href: '/statistics' },
    ]);
  }, [setBreadCrumb]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const [statsRes, progressionRes, activityRes, coursesRes, enrollmentRes, ticketsRes] = await Promise.all([
        fetch(`${apiUrl}/dashboard/stats`),
        fetch(`${apiUrl}/dashboard/user-progression`),
        fetch(`${apiUrl}/dashboard/monthly-activity`),
        fetch(`${apiUrl}/dashboard/popular-courses`),
        fetch(`${apiUrl}/dashboard/enrollment-stats`),
        fetch(`${apiUrl}/dashboard/ticket-stats`),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (progressionRes.ok) setProgression(await progressionRes.json());
      if (activityRes.ok) setActivity(await activityRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (enrollmentRes.ok) setEnrollmentStats(await enrollmentRes.json());
      if (ticketsRes.ok) setTicketStats(await ticketsRes.json());
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center mih="500px">
        <Loader />
      </Center>
    );
  }

  const COLORS = ['#4A9FD8', '#50C878', '#FFB84D', '#FF6B6B'];

  return (
    <Container fluid>
      <Stack gap="lg">
        {/* Main Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          <Card withBorder p="lg" radius="md" shadow="sm">
            <Group justify="space-between" mb="xs">
              <Text fw={600} size="sm" c="dimmed">
                Total Utilisateurs
              </Text>
              <ThemeIcon variant="light" size="lg" radius="md" color="blue">
                <IconUsers size={20} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">
              {stats?.totalUsers || 0}
            </Text>
            <Text c="dimmed" size="xs" mt="md">
              <span style={{ color: '#50C878' }}>+12% </span> vs dernier mois
            </Text>
          </Card>

          <Card withBorder p="lg" radius="md" shadow="sm">
            <Group justify="space-between" mb="xs">
              <Text fw={600} size="sm" c="dimmed">
                Cours Actifs
              </Text>
              <ThemeIcon variant="light" size="lg" radius="md" color="green">
                <IconBook size={20} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">
              {stats?.activeCourses || 0}
            </Text>
            <Text c="dimmed" size="xs" mt="md">
              <span style={{ color: '#50C878' }}>+5 </span> cours ajoutés
            </Text>
          </Card>

          <Card withBorder p="lg" radius="md" shadow="sm">
            <Group justify="space-between" mb="xs">
              <Text fw={600} size="sm" c="dimmed">
                Mini-projets
              </Text>
              <ThemeIcon variant="light" size="lg" radius="md" color="orange">
                <IconTarget size={20} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">
              {stats?.miniProjects || 0}
            </Text>
            <Text c="dimmed" size="xs" mt="md">
              <span style={{ color: '#50C878' }}>+8 </span> en cours
            </Text>
          </Card>

          <Card withBorder p="lg" radius="md" shadow="sm">
            <Group justify="space-between" mb="xs">
              <Text fw={600} size="sm" c="dimmed">
                Tickets Validés
              </Text>
              <ThemeIcon variant="light" size="lg" radius="md" color="teal">
                <IconCheckCircle size={20} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">
              {stats?.validatedTickets || 0}
            </Text>
            <Text c="dimmed" size="xs" mt="md">
              <span style={{ color: '#50C878' }}>+42 </span> cette semaine
            </Text>
          </Card>
        </SimpleGrid>

        {/* Enrollment & Ticket Stats */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {enrollmentStats && (
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Text fw={600} size="lg" mb="lg">
                Statistiques des Inscriptions
              </Text>
              <SimpleGrid cols={2} spacing="md">
                <Stack align="center" gap="xs">
                  <RingProgress
                    sections={[
                      { value: (enrollmentStats.completed / enrollmentStats.totalEnrolled) * 100, color: '#50C878' },
                      { value: (enrollmentStats.inProgress / enrollmentStats.totalEnrolled) * 100, color: '#4A9FD8' },
                      { value: (enrollmentStats.notStarted / enrollmentStats.totalEnrolled) * 100, color: '#FFB84D' },
                    ]}
                    size={120}
                    thickness={8}
                    label={
                      <div style={{ textAlign: 'center' }}>
                        <Text fw={700} size="lg">
                          {enrollmentStats.totalEnrolled}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Total
                        </Text>
                      </div>
                    }
                  />
                </Stack>
                <Stack justify="center" gap="sm">
                  <Group gap="xs">
                    <ThemeIcon size="sm" radius="xl" color="#50C878" />
                    <div>
                      <Text size="sm" fw={600}>
                        Complétées
                      </Text>
                      <Text size="xs" c="dimmed">
                        {enrollmentStats.completed}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size="sm" radius="xl" color="#4A9FD8" />
                    <div>
                      <Text size="sm" fw={600}>
                        En cours
                      </Text>
                      <Text size="xs" c="dimmed">
                        {enrollmentStats.inProgress}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size="sm" radius="xl" color="#FFB84D" />
                    <div>
                      <Text size="sm" fw={600}>
                        Non commencé
                      </Text>
                      <Text size="xs" c="dimmed">
                        {enrollmentStats.notStarted}
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </SimpleGrid>
            </Card>
          )}

          {ticketStats && (
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Text fw={600} size="lg" mb="lg">
                Statistiques des Tickets
              </Text>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Validés', value: ticketStats.validated },
                      { name: 'En attente', value: ticketStats.pending },
                      { name: 'Rejetés', value: ticketStats.rejected },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <SimpleGrid cols={3} spacing="xs" mt="md">
                <div style={{ textAlign: 'center' }}>
                  <Text size="sm" fw={600} c="dimmed">
                    Validés
                  </Text>
                  <Text fw={700} size="lg">
                    {ticketStats.validated}
                  </Text>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text size="sm" fw={600} c="dimmed">
                    En attente
                  </Text>
                  <Text fw={700} size="lg">
                    {ticketStats.pending}
                  </Text>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text size="sm" fw={600} c="dimmed">
                    Rejetés
                  </Text>
                  <Text fw={700} size="lg">
                    {ticketStats.rejected}
                  </Text>
                </div>
              </SimpleGrid>
            </Card>
          )}
        </SimpleGrid>

        {/* Charts Section */}
        <Tabs defaultValue="progression">
          <Tabs.List>
            <Tabs.Tab value="progression" leftSection={<IconTrendingUp size={14} />}>
              Progression Utilisateurs
            </Tabs.Tab>
            <Tabs.Tab value="activity" leftSection={<IconClock size={14} />}>
              Activité Hebdomadaire
            </Tabs.Tab>
            <Tabs.Tab value="courses" leftSection={<IconBook size={14} />}>
              Cours Populaires
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="progression" pt="xl">
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Text fw={600} size="lg" mb="lg">
                Progression des Utilisateurs
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progression}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#4A9FD8"
                    name="Actifs"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#50C878"
                    name="Complétés"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="activity" pt="xl">
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Text fw={600} size="lg" mb="lg">
                Activité par Jour
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completions" fill="#50C878" name="Complétions" />
                  <Bar dataKey="incomplete" fill="#FFB84D" name="Non complétées" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="courses" pt="xl">
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Text fw={600} size="lg" mb="lg">
                Cours les Plus Populaires
              </Text>
              <Stack gap="md">
                {courses.map((course, index) => (
                  <Paper key={index} p="md" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                      <Text fw={500}>{course.name}</Text>
                      <Text fw={700} c={course.color}>
                        {course.progress}%
                      </Text>
                    </Group>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#E0E0E0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${course.progress}%`,
                          height: '100%',
                          backgroundColor: course.color,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </Paper>
                ))}
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
};
