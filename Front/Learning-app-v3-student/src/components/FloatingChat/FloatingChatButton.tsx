import React, { useState, useEffect, useRef } from 'react';
import { ActionIcon, Badge } from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import './FloatingChatButton.css';
import { ChatModal } from './ChatModal';
import chatService from '../../services/chatService';
import { authService } from '../../services/authService';

interface FloatingChatButtonProps {
  courseId: number;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ courseId }) => {
  const user = authService.getUserInfo();
  const [opened, setOpened] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const autoUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const conversations = await chatService.getConversationByCourseStudent(courseId, user.id);
      let totalUnread = 0;
      for (const conv of conversations) {
        if (conv.unreadStudentCount) {
          totalUnread += conv.unreadStudentCount;
        }
      }
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Initial fetch and auto-update
  useEffect(() => {
    fetchUnreadCount();

    // Auto-update unread count every 2 seconds when modal is closed
    autoUpdateIntervalRef.current = setInterval(() => {
      if (!opened) {
        fetchUnreadCount();
      }
    }, 2000);

    return () => {
      if (autoUpdateIntervalRef.current) {
        clearInterval(autoUpdateIntervalRef.current);
      }
    };
  }, [courseId, user, opened]);

  return (
    <>
      {!opened && (
        <div className="floating-chat-button">
          <ActionIcon
            className="chat-icon"
            size="lg"
            radius="xl"
            onClick={() => setOpened(true)}
            title="Ouvrir le chat"
          >
            <IconMessageCircle size={24} />
          </ActionIcon>
          {unreadCount > 0 && (
            <Badge color="red" circle size="sm" className="unread-badge">
              {unreadCount}
            </Badge>
          )}
        </div>
      )}

      <ChatModal
        courseId={courseId}
        opened={opened}
        onOpen={() => {
          // Clear unread count when opening modal
          setUnreadCount(0);
        }}
        onClose={() => {
          setOpened(false);
          // Refresh unread count when closing chat
          setTimeout(() => fetchUnreadCount(), 500);
        }}
      />
    </>
  );
};
