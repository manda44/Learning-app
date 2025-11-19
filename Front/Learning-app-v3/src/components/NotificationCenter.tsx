import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Badge, Group, Stack, Text, Empty, Loader, ActionIcon, ScrollArea } from '@mantine/core';
import { IconBell, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../services/notificationService';
import { authService } from '../services/authService';

interface NotificationCenterProps {
  opened: boolean;
  onClose: () => void;
}

const NOTIFICATION_ICONS: Record<string, JSX.Element> = {
  'TicketCompleted': <span>✅</span>,
  'CourseFinished': <span>🏁</span>,
  'CourseStarted': <span>🚀</span>,
  'Message': <span>💬</span>,
  'TicketValidated': <span>✔️</span>,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  'TicketCompleted': 'teal',
  'CourseFinished': 'blue',
  'CourseStarted': 'grape',
  'Message': 'cyan',
  'TicketValidated': 'green',
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ opened, onClose }) => {
  const user = authService.getUserInfo();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications(user.id, false);
      setNotifications(data);
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (opened) {
      fetchNotifications();

      // Poll for new notifications every 5 seconds while modal is open
      const interval = setInterval(() => {
        fetchNotifications();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [opened, user, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const deletedNotif = notifications.find((n) => n.notificationId === notificationId);
      setNotifications(notifications.filter((n) => n.notificationId !== notificationId));
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: '100%' }}>
          <Group>
            <IconBell size={20} />
            <Text fw={600}>Notifications</Text>
          </Group>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={onClose}
            title="Close"
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>
      }
      size="lg"
      centered
      closeOnEscape={true}
      closeOnClickOutside={true}
      closeButtonProps={{ 'aria-label': 'Fermer les notifications' }}
      styles={{
        content: {
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Stack gap="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header avec bouton pour marquer tout comme lu */}
        <Group justify="space-between">
          <Group>
            <Text fw={500}>
              {unreadCount > 0 ? (
                <>
                  Vous avez <Badge color="red">{unreadCount}</Badge> notification(s) non lue(s)
                </>
              ) : (
                'Aucune notification non lue'
              )}
            </Text>
          </Group>
          {unreadCount > 0 && (
            <Button
              variant="subtle"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAllAsRead();
              }}
            >
              Marquer tout comme lu
            </Button>
          )}
        </Group>

        {/* Liste des notifications avec scrollable area */}
        <ScrollArea style={{ flex: 1, minHeight: 0 }}>
          {loading ? (
            <Loader mx="auto" />
          ) : notifications.length === 0 ? (
            <Empty description="Aucune notification" />
          ) : (
            <Stack gap="sm" pr="md">
              {notifications.map((notif) => (
                <NotificationItem
                  key={notif.notificationId}
                  notification={notif}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </Stack>
          )}
        </ScrollArea>

        {/* Close button - always visible at bottom */}
        <Button
          variant="light"
          color="gray"
          fullWidth
          mt="md"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          Fermer
        </Button>
      </Stack>
    </Modal>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const icon = NOTIFICATION_ICONS[notification.type] || '📢';
  const color = NOTIFICATION_COLORS[notification.type] || 'gray';
  const createdDate = new Date(notification.createdAt).toLocaleString('fr-FR');

  return (
    <div
      style={{
        padding: '12px',
        border: `1px solid ${notification.isRead ? '#e9ecef' : '#ff6b6b'}`,
        borderRadius: '8px',
        backgroundColor: notification.isRead ? '#f8f9fa' : '#fff5f5',
      }}
    >
      <Group justify="space-between" mb="xs">
        <Group>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <div>
            <Text fw={500} size="sm">
              {notification.title}
            </Text>
            <Badge color={color} size="sm" variant="light">
              {notification.type}
            </Badge>
          </div>
        </Group>
        <Text size="xs" c="dimmed">
          {createdDate}
        </Text>
      </Group>

      <Text size="sm" mb="xs">
        {notification.message}
      </Text>

      <Group justify="flex-end" gap="xs">
        {!notification.isRead && (
          <ActionIcon
            variant="light"
            color="blue"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.notificationId);
            }}
            title="Marquer comme lu"
          >
            <IconCheck size={16} />
          </ActionIcon>
        )}
        <ActionIcon
          variant="light"
          color="red"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.notificationId);
          }}
          title="Supprimer"
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </div>
  );
};
