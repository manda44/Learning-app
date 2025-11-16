import React, { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Stack,
  Textarea,
  Group,
  Button,
  Text,
  ActionIcon,
  Center,
  Loader,
  Alert,
  Card,
  FileInput
} from '@mantine/core';
import { IconSend, IconX, IconAlertCircle } from '@tabler/icons-react';
import ScrollToBottom from 'react-scroll-to-bottom';
import { format } from 'date-fns';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import './ChatModal.css';
import chatService from '../../services/chatService';
import type { ChatMessage, ChatConversation } from '../../services/chatService';
import { authService } from '../../services/authService';

interface ChatModalProps {
  courseId: number;
  opened: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  courseId,
  opened,
  onClose,
}) => {
  const user = authService.getUserInfo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<Array<{ src: string }>>([]);
  const autoUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load or create conversation when modal opens
  useEffect(() => {
    if (!opened || !user) return;

    const initializeConversation = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get existing conversation or create new one
        const conversations = await chatService.getConversationByCourseStudent(
          courseId,
          user!.id
        );

        if (conversations.length > 0) {
          setConversation(conversations[0]);
          await loadMessages(conversations[0].chatConversationId);
        } else {
          // Create new conversation
          const newConversation = await chatService.createConversation({
            courseId,
            studentId: user!.id,
            title: `Chat - Course ${courseId}`,
          });
          setConversation(newConversation);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load chat';
        setError(errorMessage);
        console.error('Error initializing conversation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConversation();
  }, [opened, courseId, user]);

  const loadMessages = async (conversationId: number) => {
    try {
      const msgs = await chatService.getConversationMessages(conversationId, 1, 50);
      setMessages(msgs.reverse());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      console.error('Error loading messages:', err);
    }
  };

  // Auto-update messages every 2 seconds when drawer is open
  useEffect(() => {
    if (!opened || !conversation) return;

    const messageUpdateInterval = setInterval(() => {
      loadMessages(conversation.chatConversationId);
    }, 2000);

    return () => clearInterval(messageUpdateInterval);
  }, [opened, conversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() && !selectedImage) return;
    if (!conversation || !user) return;

    setIsSending(true);
    setError(null);

    try {
      // Send text message
      const newMessage = await chatService.sendMessage({
        chatConversationId: conversation.chatConversationId,
        senderId: user!.id,
        content: messageText || (selectedImage ? 'Image attachment' : ''),
      });

      // Upload image if selected
      if (selectedImage) {
        await chatService.uploadAttachment(newMessage.chatMessageId, selectedImage);
        // Reload message to get attachment data
        const updatedMessage = await chatService.getMessage(newMessage.chatMessageId);
        setMessages((prev) => [...prev, updatedMessage]);
      } else {
        setMessages((prev) => [...prev, newMessage]);
      }

      setMessageText('');
      setSelectedImage(null);

      // Mark as read
      await chatService.markConversationAsRead(conversation.chatConversationId, {
        userId: user!.id,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenImage = (imageUrl: string, allAttachments?: any[]) => {
    if (!allAttachments) return;
    const imageAttachments = allAttachments.filter((att) =>
      att.fileType === 'image' || att.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    const index = imageAttachments.findIndex((att) => att.fileUrl === imageUrl);
    setLightboxSlides(imageAttachments.map((att) => ({ src: att.fileUrl })));
    setLightboxIndex(Math.max(0, index));
    setLightboxOpen(true);
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Support Chat"
      position="right"
      size={450}
      padding={0}
      styles={{
        header: { borderBottom: '1px solid #e9ecef', padding: '1rem' },
        body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' },
      }}
    >
      <Stack gap={0} h="100%" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Loading State */}
        {isLoading && (
          <Center h="300px">
            <Loader size="sm" />
          </Center>
        )}

        {/* Error Alert */}
        {error && !isLoading && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} p="md">
            {error}
          </Alert>
        )}

        {/* Messages Area */}
        {!isLoading && (
          <>
            <ScrollToBottom className="chat-messages" style={{ flex: 1, padding: '1rem' }}>
              {messages.length === 0 ? (
                <Center h="100%">
                  <Stack align="center" gap="xs">
                    <Text size="sm" c="dimmed">
                      Pas de messages
                    </Text>
                    <Text size="xs" c="dimmed">
                      Commencez une conversation
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <Stack gap="md">
                  {messages.map((msg) => (
                    <div
                      key={msg.chatMessageId}
                      style={{
                        display: 'flex',
                        justifyContent:
                          msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Card
                        withBorder
                        p="sm"
                        style={{
                          maxWidth: '70%',
                          backgroundColor:
                            msg.senderId === user?.id ? '#e7f5ff' : '#f8f9fa',
                        }}
                      >
                        <Stack gap="xs">
                          <Group justify="space-between" gap="xs">
                            <Text fw={600} size="sm">
                              {msg.senderId === user?.id ? 'Vous' : 'Support'}
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
                                      onError={(e) => {
                                        console.error('Image load error:', {
                                          src: attachment.fileUrl,
                                          error: e,
                                        });
                                      }}
                                      onLoad={() => {
                                        console.log('Image loaded successfully:', attachment.fileUrl);
                                      }}
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
                placeholder="Votre message..."
                value={messageText}
                onChange={(e) => setMessageText(e.currentTarget.value)}
                onKeyDown={handleKeyPress}
                minRows={3}
                maxRows={5}
                disabled={isSending}
              />
              <Group gap="xs">
                <FileInput
                  accept="image/*"
                  value={selectedImage}
                  onChange={setSelectedImage}
                  disabled={isSending}
                  clearable
                  placeholder="Sélectionner une image"
                />
              </Group>
              <Group justify="flex-end" gap="xs">
                <Button
                  variant="light"
                  onClick={onClose}
                >
                  Fermer
                </Button>
                <Button
                  onClick={handleSendMessage}
                  loading={isSending}
                  leftSection={<IconSend size={16} />}
                >
                  Envoyer
                </Button>
              </Group>
            </Stack>
          </>
        )}
      </Stack>

      {/* Lightbox for image viewing */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
      />
    </Drawer>
  );
};
