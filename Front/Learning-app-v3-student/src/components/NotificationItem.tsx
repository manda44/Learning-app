import React from 'react';
import {
  Card,
  Group,
  Stack,
  Text,
  Badge,
  ActionIcon,
  ThemeIcon,
} from '@mantine/core';
import { IconTrash, IconCheck, IconAlertCircle, IconMail, IconAward } from '@tabler/icons-react';
import { useNotificationStore } from '../store/notificationStore';
import type { NotificationDto } from '../types/notification';
import { NotificationType, NotificationPriority } from '../types/notification';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationItemProps {
  notification: NotificationDto;
  onActionClick?: (actionUrl: string) => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case NotificationType.COURSE_UPDATE:
      return <IconMail size={16} />;
    case NotificationType.GRADE_RECEIVED:
      return <IconAward size={16} />;
    case NotificationType.SYSTEM_ALERT:
      return <IconAlertCircle size={16} />;
    default:
      return <IconMail size={16} />;
  }
};

const getNotificationColor = (type: string): string => {
  switch (type) {
    case NotificationType.COURSE_UPDATE:
      return 'blue';
    case NotificationType.ENROLLMENT_CONFIRMATION:
      return 'green';
    case NotificationType.QUIZ_REMINDER:
      return 'orange';
    case NotificationType.GRADE_RECEIVED:
      return 'purple';
    case NotificationType.PROJECT_FEEDBACK:
      return 'cyan';
    case NotificationType.ADMIN_MESSAGE:
      return 'indigo';
    case NotificationType.SYSTEM_ALERT:
      return 'red';
    default:
      return 'gray';
  }
};

const getPriorityColor = (priority?: number) => {
  switch (priority) {
    case NotificationPriority.URGENT:
      return 'red';
    case NotificationPriority.HIGH:
      return 'orange';
    case NotificationPriority.MEDIUM:
      return 'yellow';
    case NotificationPriority.LOW:
      return 'gray';
    default:
      return 'gray';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onActionClick,
}) => {
  const { markAsRead, deleteNotification } = useNotificationStore();

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.notificationId);
  };

  const handleActionClick = () => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
    if (notification.actionUrl && onActionClick) {
      onActionClick(notification.actionUrl);
    }
  };

  const typeColor = getNotificationColor(notification.type);
  const priorityColor = getPriorityColor(notification.priority);

  return (
    <Card
      p="sm"
      radius="md"
      style={{
        border: `1px solid var(--mantine-color-gray-${notification.isRead ? '2' : '3'})`,
        backgroundColor: notification.isRead ? undefined : 'var(--mantine-color-blue-0)',
        cursor: notification.actionUrl ? 'pointer' : 'default',
      }}
      onClick={handleActionClick}
    >
      <Stack gap="xs">
        {/* Header with icon and type */}
        <Group justify="space-between">
          <Group gap="xs">
            <ThemeIcon size="sm" variant="light" color={typeColor} radius="md">
              {getNotificationIcon(notification.type)}
            </ThemeIcon>
            <Stack gap={0}>
              <Text fw={notification.isRead ? 500 : 600} size="sm">
                {notification.title}
              </Text>
              <Text size="xs" c="dimmed">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </Text>
            </Stack>
          </Group>

          {!notification.isRead && (
            <Badge size="sm" color="blue">
              New
            </Badge>
          )}
        </Group>

        {/* Message */}
        <Text size="sm" c={notification.isRead ? 'dimmed' : undefined}>
          {notification.message}
        </Text>

        {/* Priority and Actions */}
        <Group justify="space-between">
          {notification.priority && (
            <Badge size="xs" color={priorityColor} variant="light">
              {['Low', 'Medium', 'High', 'Urgent'][notification.priority] || 'Normal'}
            </Badge>
          )}

          <Group gap={4}>
            {!notification.isRead && (
              <ActionIcon
                size="xs"
                variant="subtle"
                color="blue"
                onClick={handleMarkAsRead}
                title="Mark as read"
              >
                <IconCheck size={14} />
              </ActionIcon>
            )}
            <ActionIcon
              size="xs"
              variant="subtle"
              color="red"
              onClick={handleDelete}
              title="Delete notification"
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};
