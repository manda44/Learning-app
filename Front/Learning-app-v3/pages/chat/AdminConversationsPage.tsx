import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Container,
  Stack,
  Group,
  Button,
  Select,
  TextInput,
  Drawer,
  Textarea,
  Badge,
  Card,
  Text,
  Avatar,
  Loader,
  Center,
  Alert,
  ActionIcon,
  ScrollArea,
  SimpleGrid,
  FileInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSearch,
  IconMessage,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconSend,
} from '@tabler/icons-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { format } from 'date-fns';
import ScrollToBottom from 'react-scroll-to-bottom';
import { useGeneralStore } from '../../store/generalStore';
import { useModalStore } from '../../store/modalStore';
import chatAdminService, { ChatConversationAdmin, ChatMessageAdmin } from '../../src/services/chatAdminService';
import { getCourseList } from '../../services/courseService';
import type { Course } from '../../types/Course';
import { getUserInfo } from '../../services/authService';

const AdminConversationsPage = () => {
  const setBreadCrumb = useGeneralStore((state) => state.setBreadCrumb);
  const { showModal } = useModalStore();
  const user = getUserInfo();

  // State management
  const [conversations, setConversations] = useState<ChatConversationAdmin[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<ChatConversationAdmin>>({
    columnAccessor: 'lastMessageAt',
    direction: 'desc',
  });

  // Messages modal state
  const [messagesOpened, { open: openMessages, close: closeMessages }] = useDisclosure(false);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversationAdmin | null>(null);
  const [messages, setMessages] = useState<ChatMessageAdmin[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<Array<{ src: string }>>([]);
  const autoUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Breadcrumb
  useEffect(() => {
    setBreadCrumb([
      {
        title: 'Chat & Messagerie',
        href: '/chat',
      },
      {
        title: 'Conversations avec les étudiants',
        href: '/chat/conversations',
      },
    ] as any);
  }, [setBreadCrumb]);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseList = await getCourseList();
        setCourses(courseList);
      } catch (error) {
        showModal('error', 'Erreur lors du chargement des cours');
        console.error(error);
      }
    };
    fetchCourses();
  }, [showModal]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setFetching(true);
    try {
      let conversationList: ChatConversationAdmin[] = [];

      if (selectedCourseId) {
        conversationList = await chatAdminService.getCourseConversations(parseInt(selectedCourseId));
      } else {
        conversationList = await chatAdminService.getAllConversations();
      }

      // Enrich conversations with course names
      let conversationsWithCourses = conversationList.map((conv) => {
        const course = courses.find((c) => c.courseId === conv.courseId);
        return {
          ...conv,
          courseName: course?.courseName || `Cours #${conv.courseId}`,
        };
      });

      // Filter by search query
      if (searchQuery.trim()) {
        conversationsWithCourses = conversationsWithCourses.filter(
          (conv) =>
            conv.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setPage(1);
      const sorted = sortBy(conversationsWithCourses, sortStatus.columnAccessor as keyof any);
      const sortedList = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
      setConversations(sortedList);
    } catch (error) {
      showModal('error', 'Erreur lors du chargement des conversations');
      console.error(error);
    } finally {
      setFetching(false);
    }
  }, [selectedCourseId, searchQuery, sortStatus, courses, showModal]);

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: number) => {
    setMessagesLoading(true);
    try {
      const msgs = await chatAdminService.getConversationMessages(conversationId, 1, 100);
      setMessages(msgs.reverse());
      await chatAdminService.markConversationAsReadByAdmin(conversationId, user?.userId || 0);
      // Refresh conversations to update unread counts
      await fetchConversations();
    } catch (error) {
      showModal('error', 'Erreur lors du chargement des messages');
      console.error(error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Open conversation details
  const handleOpenConversation = (conversation: ChatConversationAdmin) => {
    setSelectedConversation(conversation);
    openMessages();
    fetchMessages(conversation.chatConversationId);
  };

  // Send message as admin
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) {
      showModal('warning', 'Veuillez entrer un message ou sélectionner une image');
      return;
    }
    if (!selectedConversation || !user) return;

    setSendingMessage(true);
    try {
      const message = await chatAdminService.sendAdminMessage(
        selectedConversation.chatConversationId,
        user.userId,
        newMessage || (selectedImage ? 'Image attachment' : '')
      );

      // Upload image if selected
      if (selectedImage) {
        await chatAdminService.uploadAttachment(message.chatMessageId, selectedImage);
        // Reload message to get attachment data
        const updatedMessage = await chatAdminService.getMessage(message.chatMessageId);
        setMessages([...messages, updatedMessage]);
      } else {
        setMessages([...messages, message]);
      }

      setNewMessage('');
      setSelectedImage(null);
    } catch (error) {
      showModal('error', 'Erreur lors de l\'envoi du message');
      console.error(error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Close conversation
  const handleCloseConversation = async (conversationId: number) => {
    try {
      await chatAdminService.closeConversation(conversationId);
      fetchConversations();
      closeMessages();
      showModal('success', 'Conversation fermée');
    } catch (error) {
      showModal('error', 'Erreur lors de la fermeture de la conversation');
      console.error(error);
    }
  };

  // Handle opening image in lightbox
  const handleOpenImage = (imageUrl: string, allAttachments: any[]) => {
    const imageAttachments = allAttachments.filter((att) =>
      att.fileType === 'image' || att.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    const index = imageAttachments.findIndex((att) => att.fileUrl === imageUrl);
    setLightboxSlides(imageAttachments.map((att) => ({ src: att.fileUrl })));
    setLightboxIndex(Math.max(0, index));
    setLightboxOpen(true);
  };

  // Effects for fetching conversations
  useEffect(() => {
    if (courses.length === 0) return; // Wait for courses to load

    const timer = setTimeout(() => {
      fetchConversations();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchConversations, courses]);

  // Auto-update conversations every 3 seconds
  useEffect(() => {
    autoUpdateIntervalRef.current = setInterval(() => {
      fetchConversations();
    }, 3000);

    return () => {
      if (autoUpdateIntervalRef.current) {
        clearInterval(autoUpdateIntervalRef.current);
      }
    };
  }, [fetchConversations]);

  // Auto-update messages when drawer is open
  useEffect(() => {
    if (!messagesOpened || !selectedConversation) return;

    const messageUpdateInterval = setInterval(() => {
      fetchMessages(selectedConversation.chatConversationId);
    }, 2000);

    return () => clearInterval(messageUpdateInterval);
  }, [messagesOpened, selectedConversation]);

  // Pagination
  const paginatedConversations = conversations.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Text fw={700} size="lg">
              Conversations avec les étudiants
            </Text>
            <Text c="dimmed" size="sm">
              Gérez les messages et conversations par cours
            </Text>
          </div>
          <Badge size="lg" variant="filled">
            {conversations.length} conversation(s)
          </Badge>
        </Group>

        {/* Filters */}
        <Card withBorder>
          <Stack gap="md">
            <Group grow>
              <Select
                label="Filtrer par cours"
                placeholder="Tous les cours"
                data={courses?.map((course) => ({
                  value: course?.courseId?.toString() || '',
                  label: course?.courseName || `Cours #${course?.courseId}`,
                })) || []}
                value={selectedCourseId}
                onChange={setSelectedCourseId}
                clearable
                searchable
              />
              <TextInput
                label="Rechercher étudiant ou cours"
                placeholder="Nom de l'étudiant..."
                icon={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />
            </Group>
          </Stack>
        </Card>

        {/* Conversations Table */}
        <Card withBorder>
          {conversations.length === 0 ? (
            <Center h={300}>
              <Stack align="center" gap="xs">
                <IconMessage size={32} />
                <Text c="dimmed">Aucune conversation</Text>
              </Stack>
            </Center>
          ) : (
            <DataTable
              idAccessor="chatConversationId"
              records={paginatedConversations}
              columns={[
                {
                  accessor: 'studentName',
                  title: 'Étudiant',
                  render: (record) => (
                    <Group gap="xs">
                      <Avatar size="sm" radius="xl" name={record.studentName} />
                      <div>
                        <Text fw={500} size="sm">
                          {record.studentName}
                        </Text>
                        <Text c="dimmed" size="xs">
                          ID: {record.studentId}
                        </Text>
                      </div>
                    </Group>
                  ),
                },
                {
                  accessor: 'courseName',
                  title: 'Cours',
                },
                {
                  accessor: 'unreadStudentCount',
                  title: 'Non lus (étudiant)',
                  render: (record) => (
                    <Badge color={record.unreadStudentCount > 0 ? 'red' : 'gray'} variant="dot">
                      {record.unreadStudentCount}
                    </Badge>
                  ),
                },
                {
                  accessor: 'unreadAdminCount',
                  title: 'Non lus (admin)',
                  render: (record) => (
                    <Badge color={record.unreadAdminCount > 0 ? 'orange' : 'gray'} variant="dot">
                      {record.unreadAdminCount}
                    </Badge>
                  ),
                },
                {
                  accessor: 'lastMessageAt',
                  title: 'Dernière activité',
                  render: (record) =>
                    record.lastMessageAt ? format(new Date(record.lastMessageAt), 'dd/MM/yyyy HH:mm') : 'N/A',
                },
                {
                  accessor: 'actions',
                  title: 'Actions',
                  width: '10%',
                  render: (record) => (
                    <Group gap={0} justify="flex-end">
                      <ActionIcon
                        color="blue"
                        variant="subtle"
                        onClick={() => handleOpenConversation(record)}
                      >
                        <IconMessage size={16} />
                      </ActionIcon>
                    </Group>
                  ),
                },
              ]}
              totalRecords={conversations.length}
              recordsPerPage={pageSize}
              page={page}
              onPageChange={setPage}
              sortStatus={sortStatus}
              onSortStatusChange={setSortStatus}
            />
          )}
        </Card>
      </Stack>

      {/* Messages Drawer */}
      <Drawer
        opened={messagesOpened}
        onClose={closeMessages}
        title={`Conversation avec ${selectedConversation?.studentName || ''}`}
        position="right"
        size={450}
        padding={0}
        styles={{
          header: { borderBottom: '1px solid #e9ecef', padding: '1rem' },
          body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' },
        }}
      >
        <Stack gap={0} h="100%" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Messages Area */}
          <ScrollToBottom className="chat-messages" style={{ flex: 1, padding: '1rem' }}>
            {messages.length === 0 ? (
              <Center h="100%">
                <Text c="dimmed">Aucun message</Text>
              </Center>
            ) : (
              <Stack gap="md">
                {messages.map((msg) => (
                  <div
                    key={msg.chatMessageId}
                    style={{
                      display: 'flex',
                      justifyContent:
                        msg.senderId === user?.userId ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Card
                      withBorder
                      p="sm"
                      style={{
                        maxWidth: '70%',
                        backgroundColor:
                          msg.senderId === user?.userId ? '#e7f5ff' : '#f8f9fa',
                      }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between" gap="xs">
                          <Text fw={600} size="sm">
                            {msg.senderName}
                          </Text>
                          <Text c="dimmed" size="xs">
                            {format(new Date(msg.createdAt), 'HH:mm')}
                          </Text>
                        </Group>
                        <Text size="sm">{msg.content}</Text>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div>
                            {msg.attachments.map((attachment) => {
                              if (attachment.fileType === 'image' || attachment.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                                return (
                                  <img
                                    key={attachment.chatMessageAttachmentId}
                                    src={attachment.fileUrl}
                                    alt="Attachment"
                                    onClick={() => handleOpenImage(attachment.fileUrl, msg.attachments)}
                                    style={{
                                      maxWidth: '100%',
                                      maxHeight: '200px',
                                      borderRadius: '8px',
                                      marginTop: '8px',
                                      cursor: 'pointer',
                                      transition: 'transform 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                      (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.target as HTMLImageElement).style.transform = 'scale(1)';
                                    }}
                                  />
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                      </Stack>
                    </Card>
                  </div>
                ))}
              </Stack>
            )}
          </ScrollToBottom>

          {/* Input Area */}
          <Stack gap="xs" p="md" style={{ borderTop: '1px solid #e9ecef', flexShrink: 0 }}>
            {/* Image Preview */}
            {selectedImage && (
              <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100px' }}>
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100px',
                    borderRadius: '8px',
                  }}
                />
                <ActionIcon
                  size="xs"
                  color="red"
                  variant="filled"
                  onClick={() => setSelectedImage(null)}
                  style={{ position: 'absolute', top: 0, right: 0 }}
                >
                  <IconX size={12} />
                </ActionIcon>
              </div>
            )}
            <Textarea
              placeholder="Votre réponse..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              minRows={3}
              maxRows={5}
              disabled={sendingMessage}
            />
            <Group gap="xs">
              <FileInput
                accept="image/*"
                value={selectedImage}
                onChange={setSelectedImage}
                disabled={sendingMessage}
                clearable
                placeholder="Sélectionner une image"
              />
            </Group>
            <Group justify="flex-end" gap="xs">
              <Button
                variant="light"
                onClick={closeMessages}
              >
                Fermer
              </Button>
              <Button
                onClick={handleSendMessage}
                loading={sendingMessage}
                leftSection={<IconSend size={16} />}
              >
                Envoyer
              </Button>
              <ActionIcon
                color="red"
                variant="light"
                onClick={() =>
                  selectedConversation &&
                  handleCloseConversation(selectedConversation.chatConversationId)
                }
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>
          </Stack>
        </Stack>
      </Drawer>

      {/* Lightbox for image viewing */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
      />
    </Container>
  );
};

export default AdminConversationsPage;
