import type { MiniProject, Ticket } from '../../types/MiniProject';
import { getMiniProjectList, createMiniProject, getMiniProjectById, updateMiniProject, deleteMiniProject, getMiniProjectTickets } from '../../services/miniProjectService';
import { useEffect, useState } from 'react';
import {
  Container,
  Button,
  Modal,
  TextInput,
  ActionIcon,
  Group,
  Stack,
  Card,
  SimpleGrid,
  Text,
  Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconTicket
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { useModalStore } from '../../store/modalStore';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { useGeneralStore } from '../../store/generalStore';
import TicketManagement from './TicketManagement';

const MiniProjectPage = () => {
  const [miniProjects, setMiniProjects] = useState<MiniProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<MiniProject | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [ticketModalOpened, { open: openTicketModal, close: closeTicketModal }] = useDisclosure(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [projectIdUpdate, setProjectIdUpdate] = useState(0);
  const { showModal } = useModalStore();
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<MiniProject>>({
    columnAccessor: 'miniProjectId',
    direction: 'asc',
  });
  const [fetching, setFetching] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const setBreadCrumb = useGeneralStore(state => state.setBreadCrumb);

  const breadCrumbs = [
    {
      title: 'Cours & contenus',
      href: '/course'
    },
    {
      title: 'Mini-projets',
      href: '/miniproject'
    }
  ];

  useEffect(() => {
    setBreadCrumb(breadCrumbs as any);
  }, []);

  const fetchMiniProjects = async () => {
    setFetching(true);
    try {
      const projectList = await getMiniProjectList();
      setTotalRecords(projectList.length);
      let sorted = sortBy(projectList, sortStatus.columnAccessor as keyof MiniProject);
      sorted = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      setMiniProjects(sorted.slice(from, to));
    } catch (error) {
      showModal('error', 'Une erreur est survenue lors de l\'opération');
      console.log(error);
    }
    setFetching(false);
  };

  const fetchTickets = async (projectId: number) => {
    try {
      const projectTickets = await getMiniProjectTickets(projectId);
      setTickets(projectTickets);
    } catch (error) {
      showModal('error', 'Une erreur est survenue lors du chargement des tickets');
      console.log(error);
    }
  };

  const addMiniProject = async (project: any) => {
    try {
      await createMiniProject(project);
      fetchMiniProjects();
      showModal('success', 'Mini-projet inséré avec succès !');
    } catch (error) {
      showModal('error', 'Une erreur est survenue lors de l\'opération');
      console.log(error);
    }
  };

  const handleUpdateProject = async (project: any) => {
    try {
      await updateMiniProject(projectIdUpdate, project);
      fetchMiniProjects();
      showModal('success', 'Mini-projet modifié avec succès !');
    } catch (error) {
      showModal('error', 'Une erreur est survenue lors de l\'opération');
      console.log(error);
    }
  };

  const handleDelete = async (projectId: number) => {
    try {
      await deleteMiniProject(projectId);
      fetchMiniProjects();
      showModal('success', 'Mini-projet supprimé avec succès !');
      close();
    } catch (error) {
      showModal('error', 'Une erreur est survenue lors de l\'opération');
      console.log(error);
    }
  };

  const handleClose = () => {
    if (isUpdating)
      form.reset();
    close();
  };

  const openModalOnUpdate = async (projectId: number) => {
    const project = await getMiniProjectById(projectId);
    setProjectIdUpdate(projectId);
    form.setFieldValue('title', project.title);
    form.setFieldValue('description', project.description);
    setIsUpdating(true);
    open();
  };

  const openProjectDetails = async (project: MiniProject) => {
    setSelectedProject(project);
    await fetchTickets(project.miniProjectId);
    openTicketModal();
  };

  useEffect(() => {
    fetchMiniProjects();
  }, [page, sortStatus, pageSize]);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      description: '',
      miniProjectId: 0
    },
    validate: (values) => ({
      title:
        values.title.length === 0
          ? 'Le titre est obligatoire'
          : values.title.length < 2
            ? 'Le titre doit contenir au moins 2 caractères'
            : null,
      description:
        values.description.length === 0
          ? 'La description est obligatoire'
          : values.description.length < 2
            ? 'La description doit contenir au moins 2 caractères'
            : null
    })
  });

  function onSubmitForm(values: any) {
    if (isUpdating) {
      values.miniProjectId = projectIdUpdate;
      handleUpdateProject(values).then(() => {
        setIsUpdating(false);
        form.reset();
        close();
      });
    } else
      addMiniProject(values);
    form.reset();
    close();
  }

  function setPageSizeFooter(pageSize: any) {
    setPageSize(pageSize);
    setPage(1);
  }

  const getCompletionRate = (tickets: Ticket[]) => {
    if (tickets.length === 0) return 0;
    const completed = tickets.filter(t => t.status === 'completed').length;
    return Math.round((completed / tickets.length) * 100);
  };

  const datatableColumns = [
    {
      accessor: 'title',
      title: 'Titre',
      sortable: true
    },
    {
      accessor: 'description',
      title: 'Description',
      sortable: true
    },
    {
      accessor: 'createdAt',
      title: 'Date de création',
      sortable: true,
      render: ({ createdAt }: { createdAt: Date }) => format(new Date(createdAt), 'dd/MM/yyyy HH:mm')
    },
    {
      accessor: 'updatedAt',
      title: 'Date de modification',
      sortable: true,
      render: ({ updatedAt }: { updatedAt: Date }) => format(new Date(updatedAt), 'dd/MM/yyyy HH:mm')
    },
    {
      accessor: 'action',
      title: 'Actions',
      render: ({ miniProjectId }: { miniProjectId: number }) => (
        <Group gap={0}>
          <ActionIcon
            color='blue'
            onClick={() => {
              const project = miniProjects.find(p => p.miniProjectId === miniProjectId);
              if (project) openProjectDetails(project);
            }}
            aria-label="voir tickets"
            variant='subtle'
          >
            <IconTicket size={22} />
          </ActionIcon>
          <ActionIcon
            color='green'
            onClick={() => openModalOnUpdate(miniProjectId)}
            aria-label="modifier"
            variant='subtle'
          >
            <IconPencil size={22} />
          </ActionIcon>
          <ActionIcon
            color='red'
            onClick={() => handleDelete(miniProjectId)}
            aria-label="supprimer"
            variant='subtle'
          >
            <IconTrash size={22} />
          </ActionIcon>
        </Group>
      )
    }
  ];

  return (
    <>
      {/* Mini Projects List Section */}
      <Stack gap="md">
        <Group justify="space-between" mb="md">
          <div>
            <Text size="lg" fw={500}>Mini-projets</Text>
            <Text size="sm" c="dimmed">Gestion des mini-projets et de leurs tickets</Text>
          </div>
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={() => { setIsUpdating(false); form.reset(); open(); }}
          >
            Ajouter
          </Button>
        </Group>

        <Modal opened={opened} onClose={handleClose} title={isUpdating ? 'Modifier un mini-projet' : 'Ajouter un mini-projet'}>
          <TextInput
            label="Titre"
            withAsterisk
            key={form.key('title')}
            {...form.getInputProps('title')}
          />
          <TextInput
            label="Description"
            withAsterisk
            key={form.key('description')}
            {...form.getInputProps('description')}
          />
          <Group mt='md' justify="flex-end">
            <Button onClick={close} color="red">Annuler</Button>
            <form onSubmit={form.onSubmit(onSubmitForm)}>
              <Button type="submit">Valider</Button>
            </form>
          </Group>
        </Modal>

        {/* Statistics Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Mini-projets totaux</Text>
                <Text fw={700} size="lg">{totalRecords}</Text>
              </div>
              <Text size="xl" c="gray">📊</Text>
            </Group>
          </Card>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Tickets totaux</Text>
                <Text fw={700} size="lg">{tickets.length}</Text>
              </div>
              <Text size="xl">🎫</Text>
            </Group>
          </Card>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Taux de complétion</Text>
                <Text fw={700} size="lg">{getCompletionRate(tickets)}%</Text>
              </div>
              <Text size="xl">✅</Text>
            </Group>
          </Card>
          <Card withBorder radius="md" p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Nombre de tickets</Text>
                <Text fw={700} size="lg">{tickets.length}</Text>
              </div>
              <Text size="xl">📋</Text>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Mini Projects Table */}
        <Card withBorder radius="md" p="md">
          <Card.Section withBorder inheritPadding py="md">
            <Text fw={500} size="lg">Liste des mini-projets</Text>
          </Card.Section>

          <DataTable
            columns={datatableColumns}
            records={miniProjects}
            totalRecords={totalRecords}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={(p) => setPage(p)}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            fetching={fetching}
          />
          <Stack mt="md">
            <p style={{ marginBottom: '0px' }}>Nombre d'élément par page:</p>
            <Group gap='xs'>
              <Button
                onClick={() => setPageSizeFooter(10)}
                variant={pageSize === 10 ? 'filled' : 'subtle'}
                size="sm"
              >10</Button>
              <Button
                onClick={() => setPageSizeFooter(30)}
                variant={pageSize === 30 ? 'filled' : 'subtle'}
                size="sm"
              >30</Button>
              <Button
                onClick={() => setPageSizeFooter(100)}
                variant={pageSize === 100 ? 'filled' : 'subtle'}
                size="sm"
              >100</Button>
            </Group>
          </Stack>
        </Card>
      </Stack>

      {/* Tickets Modal */}
      {selectedProject && (
        <Modal
          opened={ticketModalOpened}
          onClose={closeTicketModal}
          title={`Tickets - ${selectedProject.title}`}
          size="lg"
        >
          <TicketManagement
            miniProjectId={selectedProject.miniProjectId}
            tickets={tickets}
            onTicketsChange={setTickets}
          />
        </Modal>
      )}
    </>
  );
};

export default MiniProjectPage;
