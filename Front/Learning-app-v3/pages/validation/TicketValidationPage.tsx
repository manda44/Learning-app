import { useEffect, useState } from 'react';
import { Container, Title, Text, Card, Group, Stack, Badge, Button, Grid, Modal, Select, Input, LoadingOverlay, Table, Center, ActionIcon, Tooltip } from '@mantine/core';
import { IconSearch, IconCheck, IconX, IconEye } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { getCourseList } from '../../services/courseService';
import { getPendingValidationTickets, getPendingValidationTicketsByCourse, validateTicket } from '../../services/miniProjectService';
import type { PendingValidationTicket } from '../../services/miniProjectService';
import DOMPurify from 'dompurify';

interface Course {
  courseId: number;
  title: string;
  description: string;
}

const TicketValidationPage = () => {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<PendingValidationTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<PendingValidationTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(searchParams.get('course') || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<PendingValidationTicket | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [validatingId, setValidatingId] = useState<number | null>(null);

  useEffect(() => {
    loadCourses();
    loadTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [selectedCourse, searchQuery, tickets]);

  const loadCourses = async () => {
    try {
      const data = await getCourseList();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getPendingValidationTickets();
      setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    if (selectedCourse) {
      filtered = filtered.filter(t => t.courseId.toString() === selectedCourse);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.ticketTitle.toLowerCase().includes(query) ||
        t.studentName.toLowerCase().includes(query) ||
        t.miniProjectTitle.toLowerCase().includes(query)
      );
    }

    setFilteredTickets(filtered);
  };

  const handleValidate = async (ticketProgressId: number) => {
    try {
      setValidatingId(ticketProgressId);
      await validateTicket(ticketProgressId);
      await loadTickets();
    } catch (error) {
      console.error('Error validating ticket:', error);
      alert('Erreur lors de la validation du ticket');
    } finally {
      setValidatingId(null);
    }
  };

  const handleViewDetails = (ticket: PendingValidationTicket) => {
    setSelectedTicket(ticket);
    openDetails();
  };

  const courseOptions = courses.map(c => ({
    value: c.courseId.toString(),
    label: c.title
  }));

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />
      <Stack gap="lg">
        <div>
          <Title order={1}>Validation des tickets</Title>
          <Text c="dimmed">Validez les tickets complétés par les étudiants</Text>
        </div>

        <Card withBorder padding="md">
          <Stack gap="md">
            <Group grow>
              <Input
                placeholder="Rechercher par titre, étudiant ou projet..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />
              <Select
                label="Filtrer par cours"
                placeholder="Tous les cours"
                data={courseOptions}
                value={selectedCourse}
                onChange={setSelectedCourse}
                clearable
              />
            </Group>
            <Group justify="apart">
              <Text size="sm" c="dimmed">
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} à valider
              </Text>
              <Button variant="light" onClick={loadTickets}>
                Rafraîchir
              </Button>
            </Group>
          </Stack>
        </Card>

        {filteredTickets.length === 0 ? (
          <Center p="xl">
            <Text c="dimmed">Aucun ticket à valider</Text>
          </Center>
        ) : (
          <Card withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Étudiant</Table.Th>
                  <Table.Th>Ticket</Table.Th>
                  <Table.Th>Projet</Table.Th>
                  <Table.Th>Cours</Table.Th>
                  <Table.Th>Date de complétion</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredTickets.map((ticket) => (
                  <Table.Tr key={ticket.ticketProgressId}>
                    <Table.Td>
                      <div>
                        <Text size="sm" fw={500}>
                          {ticket.studentName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {ticket.studentEmail}
                        </Text>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{ticket.ticketTitle}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light">{ticket.miniProjectTitle}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {ticket.courseName}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {ticket.completedDate
                          ? format(new Date(ticket.completedDate), 'dd/MM/yyyy HH:mm')
                          : '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <Tooltip label="Voir détails">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="sm"
                            onClick={() => handleViewDetails(ticket)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Valider">
                          <ActionIcon
                            variant="light"
                            color="green"
                            size="sm"
                            loading={validatingId === ticket.ticketProgressId}
                            onClick={() => handleValidate(ticket.ticketProgressId)}
                          >
                            <IconCheck size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}
      </Stack>

      {/* Ticket Details Modal */}
      <Modal
        opened={detailsOpened}
        onClose={closeDetails}
        title="Détails du ticket"
        size="lg"
        centered
      >
        {selectedTicket && (
          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} c="dimmed" mb={4}>Étudiant</Text>
              <Text>
                {selectedTicket.studentName} ({selectedTicket.studentEmail})
              </Text>
            </div>

            <div>
              <Text size="sm" fw={500} c="dimmed" mb={4}>Ticket</Text>
              <Title order={4}>{selectedTicket.ticketTitle}</Title>
            </div>

            <div>
              <Text size="sm" fw={500} c="dimmed" mb={4}>Projet</Text>
              <Text>{selectedTicket.miniProjectTitle}</Text>
            </div>

            <div>
              <Text size="sm" fw={500} c="dimmed" mb={4}>Cours</Text>
              <Badge color="blue">{selectedTicket.courseName}</Badge>
            </div>

            {selectedTicket.completedDate && (
              <div>
                <Text size="sm" fw={500} c="dimmed" mb={4}>Date de complétion</Text>
                <Text>{format(new Date(selectedTicket.completedDate), 'dd/MM/yyyy HH:mm')}</Text>
              </div>
            )}

            {selectedTicket.ticketDescription && (
              <div>
                <Text size="sm" fw={500} c="dimmed" mb={4}>Description du ticket</Text>
                <Card withBorder padding="md" radius="md">
                  <div
                    style={{ fontSize: '14px', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(selectedTicket.ticketDescription, {
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
                <Text size="sm" fw={500} c="dimmed" mb={4}>Notes de l'étudiant</Text>
                <Card withBorder padding="md" radius="md">
                  <Text>{selectedTicket.notes}</Text>
                </Card>
              </div>
            )}

            <Group mt="md" justify="flex-end">
              <Button variant="light" onClick={closeDetails}>
                Fermer
              </Button>
              <Button
                color="green"
                leftSection={<IconCheck size={16} />}
                loading={validatingId === selectedTicket.ticketProgressId}
                onClick={() => {
                  handleValidate(selectedTicket.ticketProgressId);
                  closeDetails();
                }}
              >
                Valider le ticket
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
};

export default TicketValidationPage;
