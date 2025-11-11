import type { Ticket } from '../../types/MiniProject';
import { createTicket, updateTicket, deleteTicket } from '../../services/miniProjectService';
import { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  TextInput,
  Select,
  ActionIcon,
  Group,
  Stack,
  Badge,
  Text,
  Card
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconPlus,
  IconPencil,
  IconTrash
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { useModalStore } from '../../store/modalStore';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import '@mantine/tiptap/styles.css';

interface TicketManagementProps {
  miniProjectId: number;
  tickets: Ticket[];
  onTicketsChange: (tickets: Ticket[]) => void;
}

const TicketManagement = ({ miniProjectId, tickets, onTicketsChange }: TicketManagementProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [ticketIdUpdate, setTicketIdUpdate] = useState(0);
  const { showModal } = useModalStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Ticket>>({
    columnAccessor: 'ticketId',
    direction: 'asc',
  });
  const [fetching, setFetching] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content: '',
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      description: '',
      status: 'pending',
      ticketId: 0
    },
    validate: (values) => ({
      title:
        values.title.length === 0
          ? 'Le titre est obligatoire'
          : values.title.length < 2
            ? 'Le titre doit contenir au moins 2 caractères'
            : null
    })
  });

  const addTicket = async (ticketData: any) => {
    try {
      const newTicket = await createTicket({
        ...ticketData,
        miniProjectId: miniProjectId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      onTicketsChange([...tickets, newTicket]);
      showModal('success', 'Ticket inséré avec succès !');
    } catch (error) {
      showModal('error', 'Une erreur est survenue lors de l\'opération');
      console.log(error);
    }
  };

  const handleUpdateTicket = async (ticketData: any) => {
    try {
      await updateTicket(ticketIdUpdate, ticketData);
      const updatedTickets = tickets.map(t =>
        t.ticketId === ticketIdUpdate ? { ...t, ...ticketData, updatedAt: new Date() } : t
      );
      onTicketsChange(updatedTickets);
      showModal('success', 'Ticket modifié avec succès !');
    } catch (error) {
      showModal('error', 'Une erreur est survenue lors de l\'opération');
      console.log(error);
    }
  };

  const handleDelete = async (ticketId: number) => {
    try {
      await deleteTicket(ticketId);
      onTicketsChange(tickets.filter(t => t.ticketId !== ticketId));
      showModal('success', 'Ticket supprimé avec succès !');
      close();
    } catch (error) {
      showModal('error', 'Une erreur est survenue lors de l\'opération');
      console.log(error);
    }
  };

  const handleClose = () => {
    if (isUpdating)
      form.reset();
    editor?.commands.setContent('');
    close();
  };

  const openModalOnUpdate = (ticketId: number) => {
    const ticket = tickets.find(t => t.ticketId === ticketId);
    if (ticket) {
      setTicketIdUpdate(ticketId);
      form.setFieldValue('title', ticket.title);
      form.setFieldValue('description', ticket.description);
      form.setFieldValue('status', ticket.status);
      editor?.commands.setContent(ticket.description || '');
      setIsUpdating(true);
      open();
    }
  };

  function onSubmitForm(values: any) {
    const htmlContent = editor?.getHTML() || '';
    const ticketData = {
      ...values,
      description: htmlContent
    };

    if (isUpdating) {
      ticketData.ticketId = ticketIdUpdate;
      handleUpdateTicket(ticketData).then(() => {
        setIsUpdating(false);
        form.reset();
        editor?.commands.setContent('');
        close();
      });
    } else {
      addTicket(ticketData);
      form.reset();
      editor?.commands.setContent('');
      close();
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      case 'pending':
        return 'gray';
      default:
        return 'gray';
    }
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
      sortable: true,
      render: ({ description }: { description: string }) => {
        const plainText = description?.replace(/<[^>]*>/g, '').substring(0, 100);
        return <Text size="sm" lineClamp={2}>{plainText || '-'}</Text>;
      }
    },
    {
      accessor: 'status',
      title: 'Statut',
      sortable: true,
      render: ({ status }: { status: string }) => (
        <Badge color={getStatusColor(status)}>{status}</Badge>
      )
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
      render: ({ ticketId }: { ticketId: number }) => (
        <>
          <ActionIcon
            color='green'
            onClick={() => openModalOnUpdate(ticketId)}
            aria-label="modifier"
            variant='subtle'
          >
            <IconPencil size={22} />
          </ActionIcon>
          <ActionIcon
            color='red'
            onClick={() => handleDelete(ticketId)}
            aria-label="supprimer"
            variant='subtle'
          >
            <IconTrash size={22} />
          </ActionIcon>
        </>
      )
    }
  ];

  const totalRecords = tickets.length;
  const sorted = sortBy(tickets, sortStatus.columnAccessor as keyof Ticket);
  const sortedData = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const displayedTickets = sortedData.slice(from, to);

  return (
    <Card withBorder radius="md" p="md">
      <Card.Section withBorder inheritPadding py="md">
        <Group justify="space-between">
          <Text fw={500} size="lg">Tickets du mini-projet</Text>
          <Button
            size="sm"
            leftSection={<IconPlus size={14} />}
            onClick={() => { setIsUpdating(false); form.reset(); open(); }}
          >
            Ajouter
          </Button>
        </Group>
      </Card.Section>

      <Modal
        opened={opened}
        onClose={handleClose}
        title={isUpdating ? 'Modifier un ticket' : 'Ajouter un ticket'}
        size="xl"
        styles={{
          body: { minHeight: '600px' },
          content: { maxWidth: '90vw' }
        }}
      >
        <Stack gap="md">
          <TextInput
            label="Titre"
            withAsterisk
            key={form.key('title')}
            {...form.getInputProps('title')}
          />
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500} mb={8}>
              Description <span style={{ color: 'red' }}>*</span>
            </Text>
            <RichTextEditor
              editor={editor}
              styles={{
                root: {
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                },
                content: {
                  minHeight: '400px',
                  padding: '12px',
                  fontSize: '14px',
                  '& .ProseMirror': {
                    minHeight: '380px',
                    outline: 'none',
                  }
                },
                toolbar: {
                  borderBottom: '1px solid #dee2e6',
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                }
              }}
            >
              <RichTextEditor.Toolbar>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                  <RichTextEditor.ClearFormatting />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                  <RichTextEditor.H4 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.Hr />
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Undo />
                  <RichTextEditor.Redo />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>
          </div>
          <Select
            label="Statut"
            placeholder="Sélectionnez un statut"
            data={[
              { value: 'pending', label: 'En attente' },
              { value: 'in_progress', label: 'En cours' },
              { value: 'completed', label: 'Complété' }
            ]}
            key={form.key('status')}
            {...form.getInputProps('status')}
          />
          <Group mt='md' justify="flex-end">
            <Button onClick={handleClose} color="red">Annuler</Button>
            <form onSubmit={form.onSubmit(onSubmitForm)}>
              <Button type="submit">Valider</Button>
            </form>
          </Group>
        </Stack>
      </Modal>

      <DataTable
        columns={datatableColumns}
        records={displayedTickets}
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
            onClick={() => { setPageSize(10); setPage(1); }}
            variant={pageSize === 10 ? 'filled' : 'subtle'}
            size="sm"
          >10</Button>
          <Button
            onClick={() => { setPageSize(30); setPage(1); }}
            variant={pageSize === 30 ? 'filled' : 'subtle'}
            size="sm"
          >30</Button>
          <Button
            onClick={() => { setPageSize(100); setPage(1); }}
            variant={pageSize === 100 ? 'filled' : 'subtle'}
            size="sm"
          >100</Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default TicketManagement;
