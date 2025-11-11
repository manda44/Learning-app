import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Card, Group, Stack, Badge, Button, Grid, Modal, TextInput, Alert } from '@mantine/core';
import { DndContext, PointerSensor, useSensor, useSensors, useDroppable, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { StudentProjectEnrollment, StudentTicketProgress } from '../services/miniProjectService';
import { getStudentProjectEnrollment, updateTicketProgress, enrollInProject, updateGitRepository } from '../services/miniProjectService';
import { IconGripVertical, IconInfoCircle, IconBrandGit } from '@tabler/icons-react';
import DOMPurify from 'dompurify';
import { useDisclosure } from '@mantine/hooks';
import { format } from 'date-fns';

const KanbanColumn = ({ title, status, tickets, color, onTicketClick, disabled }: {
  title: string;
  status: string;
  tickets: StudentTicketProgress[];
  color: string;
  onTicketClick: (ticket: StudentTicketProgress) => void;
  disabled?: boolean;
}) => {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <Card ref={setNodeRef} shadow="sm" padding="md" radius="md" withBorder h="100%" data-column-status={status} style={{ opacity: disabled ? 0.6 : 1 }}>
      <Stack gap="md">
        <Group justify="apart">
          <Title order={4}>{title}</Title>
          <Badge color={color}>{tickets.length}</Badge>
        </Group>

        <SortableContext items={tickets.map(t => t.ticketProgressId.toString())} strategy={verticalListSortingStrategy}>
          <Stack gap="sm" style={{ minHeight: '200px' }}>
            {tickets.map((ticket) => (
              <TicketCard key={ticket.ticketProgressId} ticket={ticket} onTicketClick={onTicketClick} disabled={disabled} />
            ))}
          </Stack>
        </SortableContext>
      </Stack>
    </Card>
  );
};

const TicketCard = ({ ticket, onTicketClick, disabled }: { ticket: StudentTicketProgress; onTicketClick: (ticket: StudentTicketProgress) => void; disabled?: boolean }) => {
  const isValidated = ticket.status === 'validated';
  const isDraggingDisabled = isValidated || disabled;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: ticket.ticketProgressId.toString(),
    disabled: isDraggingDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sanitizedDescription = ticket.ticket?.description
    ? DOMPurify.sanitize(ticket.ticket.description, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'a', 'blockquote', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'class', 'style'],
        KEEP_CONTENT: true
      })
    : '';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      shadow="xs"
      padding="sm"
      radius="md"
      withBorder
    >
      <Group gap="xs">
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: isDraggingDisabled ? 'not-allowed' : 'grab',
            opacity: isDraggingDisabled ? 0.5 : 1
          }}
        >
          <IconGripVertical size={16} />
        </div>
        <Stack gap={4} style={{ flex: 1, cursor: 'pointer' }} onClick={() => onTicketClick(ticket)}>
          <Text size="sm" fw={500}>{ticket.ticket?.title}</Text>
          {sanitizedDescription && (
            <div
              style={{ fontSize: '12px', color: 'var(--mantine-color-dimmed)', lineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          )}
        </Stack>
      </Group>
    </Card>
  );
};

const MiniProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState<StudentProjectEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<StudentTicketProgress | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<StudentTicketProgress | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [gitModalOpened, { open: openGitModal, close: closeGitModal }] = useDisclosure(false);
  const [gitUrl, setGitUrl] = useState('');
  const [savingGit, setSavingGit] = useState(false);
  const studentId = 1; // Static student ID for now

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (studentId && projectId) {
      loadEnrollment();
    }
  }, [studentId, projectId]);

  useEffect(() => {
    // Show Git modal if no Git URL is set
    if (enrollment && !enrollment.gitRepositoryUrl) {
      openGitModal();
    }
  }, [enrollment]);

  const loadEnrollment = async () => {
    try {
      setLoading(true);
      const data = await getStudentProjectEnrollment(studentId!, parseInt(projectId!));
      setEnrollment(data);
      setGitUrl(data.gitRepositoryUrl || '');
    } catch (error: any) {
      if (error.message.includes('Failed to fetch enrollment')) {
        try {
          await enrollInProject(studentId!, parseInt(projectId!));
          const data = await getStudentProjectEnrollment(studentId!, parseInt(projectId!));
          setEnrollment(data);
          setGitUrl(data.gitRepositoryUrl || '');
        } catch (enrollError) {
          console.error('Error enrolling in project:', enrollError);
        }
      } else {
        console.error('Error loading enrollment:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGitUrl = async () => {
    if (!gitUrl.trim()) {
      alert('Veuillez entrer un lien Git valide');
      return;
    }

    try {
      setSavingGit(true);
      await updateGitRepository(enrollment!.projectEnrollmentId, gitUrl);
      await loadEnrollment();
      closeGitModal();
    } catch (error) {
      console.error('Error saving Git URL:', error);
      alert('Erreur lors de la sauvegarde du lien Git');
    } finally {
      setSavingGit(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    // Block drag if no Git URL
    if (!enrollment?.gitRepositoryUrl) {
      return;
    }

    const ticket = enrollment?.ticketProgresses?.find(
      tp => tp.ticketProgressId.toString() === event.active.id
    );
    setActiveTicket(ticket || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over || !enrollment) return;

    // Block if no Git URL
    if (!enrollment.gitRepositoryUrl) {
      openGitModal();
      return;
    }

    const draggedTicket = enrollment.ticketProgresses?.find(
      tp => tp.ticketProgressId.toString() === active.id
    );

    if (!draggedTicket) return;

    // Block students from dragging validated tickets
    if (draggedTicket.status === 'validated') {
      console.log('Validated tickets cannot be moved by students');
      return;
    }

    // Determine the new status - over.id can be either a column status or another ticket ID
    let newStatus: string;

    // Check if over.id is a column status (pending, in_progress, completed, validated)
    const validStatuses = ['pending', 'in_progress', 'completed', 'validated'];
    const overId = over.id.toString();

    if (validStatuses.includes(overId)) {
      // Dropped directly on column
      newStatus = overId;
    } else {
      // Dropped on another ticket - find that ticket's status
      const targetTicket = enrollment.ticketProgresses?.find(
        tp => tp.ticketProgressId.toString() === overId
      );
      if (!targetTicket) return;
      newStatus = targetTicket.status;
    }

    // Block students from moving tickets to "validated" status
    if (newStatus === 'validated') {
      console.log('Students cannot move tickets to validated status');
      return;
    }

    if (newStatus !== draggedTicket.status) {
      try {
        await updateTicketProgress(draggedTicket.ticketProgressId, newStatus);
        await loadEnrollment();
      } catch (error) {
        console.error('Error updating ticket:', error);
      }
    }
  };

  const handleTicketClick = (ticket: StudentTicketProgress) => {
    setSelectedTicket(ticket);
    open();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'validated': return 'Validé';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'gray';
      case 'in_progress': return 'blue';
      case 'completed': return 'yellow';
      case 'validated': return 'green';
      default: return 'gray';
    }
  };

  if (loading) {
    return <Container><Text>Loading...</Text></Container>;
  }

  if (!enrollment) {
    return (
      <Container>
        <Text>Projet non trouvé</Text>
        <Button onClick={() => navigate('/mini-projects')}>Retour aux projets</Button>
      </Container>
    );
  }

  const hasGitUrl = !!enrollment.gitRepositoryUrl;
  const pendingTickets = enrollment.ticketProgresses?.filter(tp => tp.status === 'pending') || [];
  const inProgressTickets = enrollment.ticketProgresses?.filter(tp => tp.status === 'in_progress') || [];
  const completedTickets = enrollment.ticketProgresses?.filter(tp => tp.status === 'completed') || [];
  const validatedTickets = enrollment.ticketProgresses?.filter(tp => tp.status === 'validated') || [];

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <Group justify="apart">
            <div>
              <Title order={1}>{enrollment.miniProject?.title}</Title>
              <Text c="dimmed">{enrollment.miniProject?.description}</Text>
            </div>
            <Badge size="lg" color={enrollment.status === 'active' ? 'blue' : 'green'}>
              {enrollment.progressPercentage}%
            </Badge>
          </Group>

          {!hasGitUrl && (
            <Alert icon={<IconInfoCircle size={16} />} title="Lien Git requis" color="red">
              Vous devez ajouter un lien vers votre dépôt Git avant de pouvoir traiter les tickets.
              <Button mt="sm" leftSection={<IconBrandGit size={16} />} onClick={openGitModal}>
                Ajouter le lien Git
              </Button>
            </Alert>
          )}

          {hasGitUrl && (
            <Card withBorder padding="md">
              <Group justify="apart">
                <div>
                  <Text size="sm" c="dimmed" mb={4}>Dépôt Git</Text>
                  <Text size="sm" fw={500}>{enrollment.gitRepositoryUrl}</Text>
                </div>
                <Button variant="light" size="sm" leftSection={<IconBrandGit size={16} />} onClick={openGitModal}>
                  Modifier
                </Button>
              </Group>
            </Card>
          )}

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <KanbanColumn
                title="En attente"
                status="pending"
                tickets={pendingTickets}
                color="gray"
                onTicketClick={handleTicketClick}
                disabled={!hasGitUrl}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <KanbanColumn
                title="En cours"
                status="in_progress"
                tickets={inProgressTickets}
                color="blue"
                onTicketClick={handleTicketClick}
                disabled={!hasGitUrl}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <KanbanColumn
                title="Terminé"
                status="completed"
                tickets={completedTickets}
                color="yellow"
                onTicketClick={handleTicketClick}
                disabled={!hasGitUrl}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
              <KanbanColumn
                title="Validé"
                status="validated"
                tickets={validatedTickets}
                color="green"
                onTicketClick={handleTicketClick}
                disabled={!hasGitUrl}
              />
            </Grid.Col>
          </Grid>

          <Button onClick={() => navigate('/mini-projects')} variant="light">
            Retour aux projets
          </Button>
        </Stack>
      </Container>

      <DragOverlay>
        {activeTicket ? (() => {
          const sanitizedDescription = activeTicket.ticket?.description
            ? DOMPurify.sanitize(activeTicket.ticket.description, {
                ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'a', 'blockquote', 'span'],
                ALLOWED_ATTR: ['href', 'target', 'class', 'style'],
                KEEP_CONTENT: true
              })
            : '';

          return (
            <Card shadow="xs" padding="sm" radius="md" withBorder style={{ cursor: 'grabbing' }}>
              <Group gap="xs">
                <IconGripVertical size={16} />
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>{activeTicket.ticket?.title}</Text>
                  {sanitizedDescription && (
                    <div
                      style={{ fontSize: '12px', color: 'var(--mantine-color-dimmed)', lineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                      dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                    />
                  )}
                </Stack>
              </Group>
            </Card>
          );
        })() : null}
      </DragOverlay>

      <Modal
        opened={opened}
        onClose={close}
        title="Détails du ticket"
        size="1200px"
        centered
        styles={{
          body: { minHeight: '400px' }
        }}
      >
        {selectedTicket && (
          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} c="dimmed" mb={4}>Titre</Text>
              <Title order={3}>{selectedTicket.ticket?.title}</Title>
            </div>

            <div>
              <Text size="sm" fw={500} c="dimmed" mb={4}>Statut</Text>
              <Badge size="lg" color={getStatusColor(selectedTicket.status)}>
                {getStatusLabel(selectedTicket.status)}
              </Badge>
            </div>

            <div>
              <Text size="sm" fw={500} c="dimmed" mb={4}>Progression</Text>
              <Group gap="xs">
                <Badge variant="light" size="lg">{selectedTicket.progressPercentage}%</Badge>
              </Group>
            </div>

            {selectedTicket.startedDate && (
              <div>
                <Text size="sm" fw={500} c="dimmed" mb={4}>Date de début</Text>
                <Text>{format(new Date(selectedTicket.startedDate), 'dd/MM/yyyy HH:mm')}</Text>
              </div>
            )}

            {selectedTicket.completedDate && (
              <div>
                <Text size="sm" fw={500} c="dimmed" mb={4}>Date de complétion</Text>
                <Text>{format(new Date(selectedTicket.completedDate), 'dd/MM/yyyy HH:mm')}</Text>
              </div>
            )}

            {selectedTicket.ticket?.description && (
              <div>
                <Text size="sm" fw={500} c="dimmed" mb={8}>Description</Text>
                <Card withBorder padding="md" radius="md">
                  <div
                    style={{ fontSize: '14px', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(selectedTicket.ticket.description, {
                        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'a', 'blockquote', 'hr', 'span'],
                        ALLOWED_ATTR: ['href', 'target', 'class', 'style'],
                        KEEP_CONTENT: true
                      })
                    }}
                  />
                </Card>
              </div>
            )}

            {selectedTicket.notes && (
              <div>
                <Text size="sm" fw={500} c="dimmed" mb={4}>Notes</Text>
                <Card withBorder padding="md" radius="md">
                  <Text>{selectedTicket.notes}</Text>
                </Card>
              </div>
            )}

            <Group mt="md" justify="flex-end">
              <Button onClick={close} variant="light">Fermer</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Git Repository Modal */}
      <Modal
        opened={gitModalOpened}
        onClose={hasGitUrl ? closeGitModal : () => {}}
        title="Lien du dépôt Git"
        closeOnClickOutside={hasGitUrl}
        closeOnEscape={hasGitUrl}
        withCloseButton={hasGitUrl}
        centered
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Veuillez entrer le lien vers votre dépôt Git pour ce projet. Ce lien est obligatoire pour pouvoir traiter les tickets.
          </Text>
          <TextInput
            label="URL du dépôt Git"
            placeholder="https://github.com/username/repository"
            value={gitUrl}
            onChange={(e) => setGitUrl(e.target.value)}
            leftSection={<IconBrandGit size={16} />}
            required
          />
          <Group justify="flex-end">
            {hasGitUrl && (
              <Button variant="light" onClick={closeGitModal}>
                Annuler
              </Button>
            )}
            <Button onClick={handleSaveGitUrl} loading={savingGit}>
              Enregistrer
            </Button>
          </Group>
        </Stack>
      </Modal>
    </DndContext>
  );
};

export default MiniProjectView;
