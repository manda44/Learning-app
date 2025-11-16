import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Container,
  Stack,
  Group,
  Button,
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
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSearch,
  IconMessage,
  IconX,
  IconSend,
} from '@tabler/icons-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import { format } from 'date-fns';
import ScrollToBottom from 'react-scroll-to-bottom';
import { useGeneralStore } from '../../store/generalStore';
import { useModalStore } from '../../store/modalStore';
import chatStudentService, { ChatConversationStudent, ChatMessageStudent } from '../../src/services/chatStudentService';
import type { Course } from '../../types/Course';
import { getUserInfo } from '../../services/authService';

const StudentConversationsPage = () => {
  const setBreadCrumb = useGeneralStore((state) => state.setBreadCrumb);
  const { showModal } = useModalStore();
  const user = getUserInfo();

  // State management
  const [conversations, setConversations] = useState<ChatConversationStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<ChatConversationStudent>>({
    columnAccessor: 'lastMessageAt',
    direction: 'desc',
  });

  // Messages drawer state
  const [messagesOpened, { open: openMessages, close: closeMessages }] = useDisclosure(false);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversationStudent | null>(null);
  const [messages, setMessages] = useState<ChatMessageStudent[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const autoUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Breadcrumb
  useEffect(() => {
    setBreadCrumb([
      {
        title: 'Chat & Messagerie',
        href: '/chat',
      },
      {
        title: 'Mes conversations',
        href: '/chat/student/conversations',
      },
    ] as any);
  }, [setBreadCrumb]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setFetching(true);
    try {
      let conversationList: ChatConversationStudent[] = [];
      conversationList = await chatStudentService.getStudentConversations(user.userId);

      // Filter by search query
      if (searchQuery.trim()) {
        conversationList = conversationList.filter(
          (conv) =>
            conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.courseName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setPage(1);
      const sorted = sortBy(conversationList, sortStatus.columnAccessor as keyof any);
      const sortedList = sortStatus.direction === 'desc' ? sorted.reverse() : sorted;
      setConversations(sortedList);
    } catch (error) {
      showModal('error', 'Erreur lors du chargement des conversations');
      console.error(error);
    } finally {
      setFetching(false);
    }
  }, [searchQuery, sortStatus, showModal, user]);

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: number) => {
    setMessagesLoading(true);
    try {
      const msgs = await chatStudentService.getConversationMessages(conversationId, 1, 100);
      setMessages(msgs.reverse());
      await chatStudentService.markConversationAsReadByStudent(conversationId, user?.userId || 0);
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
  const handleOpenConversation = (conversation: ChatConversationStudent) => {
    setSelectedConversation(conversation);
    openMessages();
    fetchMessages(conversation.chatConversationId);
  };

  // Send message as student
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) {
      showModal('warning', 'Veuillez entrer un message');
      return;
    }

    setSendingMessage(true);
    try {
      const message = await chatStudentService.sendStudentMessage(
        selectedConversation.chatConversationId,
        user.userId,
        newMessage
      );
      setMessages([...messages, message]);
      setNewMessage('');
    } catch (error) {
      showModal('error', 'Erreur lors de l\'envoi du message');
      console.error(error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Effects for fetching conversations
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConversations();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchConversations]);

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
              Mes conversations
            </Text>
            <Text c="dimmed" size="sm">
              Discutez avec les administrateurs de vos cours
            </Text>
          </div>
          <Badge size="lg" variant="filled">
            {conversations.length} conversation(s)
          </Badge>
        </Group>

        {/* Search */}
        <Card withBorder>
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="Rechercher une conversation"
                placeholder="Titre ou cours..."
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
                  accessor: 'title',
                  title: 'Sujet',
                },
                {
                  accessor: 'courseName',
                  title: 'Cours',
                },
                {
                  accessor: 'unreadStudentCount',
                  title: 'Non lus (vous)',
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
        title={`Conversation: ${selectedConversation?.title || ''}`}
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
                            {msg.attachments.map((attachment) => (
                              <img
                                key={attachment.chatMessageAttachmentId}
                                src={attachment.fileUrl}
                                alt="Attachment"
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '200px',
                                  borderRadius: '8px',
                                  marginTop: '8px',
                                }}
                              />
                            ))}
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
            <Textarea
              placeholder="Votre message..."
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
            </Group>
          </Stack>
        </Stack>
      </Drawer>
    </Container>
  );
};

export default StudentConversationsPage;
