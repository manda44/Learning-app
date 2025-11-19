import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Popover,
  Stack,
  Text,
  Button,
  Group,
  Box,
  Loader,
} from '@mantine/core';
import { IconBell, IconCheck, IconArrowRight, IconX } from '@tabler/icons-react';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationItem } from './NotificationItem';
import { useNavigate } from 'react-router-dom';

interface NotificationBellProps {
  userId: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
  } = useNotificationStore();

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications(userId);
    fetchUnreadCount(userId);

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount(userId);
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, fetchNotifications, fetchUnreadCount]);

  // Fetch fresh notifications when dropdown opens
  const handleOpen = async () => {
    setOpened(true);
    await fetchNotifications(userId);
  };

  // Toggle dropdown
  const handleToggle = async () => {
    if (opened) {
      setOpened(false);
    } else {
      await handleOpen();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(userId);
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <Popover opened={opened} onClose={() => setOpened(false)} position="bottom-end">
      <Popover.Target>
        <div style={{ position: 'relative' }}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={handleToggle}
            title="Notifications"
          >
            <IconBell size={20} />
          </ActionIcon>
          {unreadCount > 0 && (
            <Badge
              color="red"
              size="sm"
              circle
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </Popover.Target>

      <Popover.Dropdown style={{ width: 400 }}>
        <Stack gap="sm">
          {/* Header */}
          <Group justify="space-between">
            <Text fw={600} size="md">
              Notifications
            </Text>
            <Group gap="xs">
              {unreadCount > 0 && (
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconCheck size={16} />}
                  onClick={handleMarkAllAsRead}
                  loading={isLoading}
                >
                  Mark all as read
                </Button>
              )}
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => setOpened(false)}
                title="Close"
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>
          </Group>

          {/* Notifications List */}
          {isLoading && notifications.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: '20px' }}>
              <Loader size="sm" />
            </Box>
          ) : notifications.length === 0 ? (
            <Text c="dimmed" size="sm" style={{ textAlign: 'center', padding: '20px' }}>
              No notifications yet
            </Text>
          ) : (
            <Stack gap="xs" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.notificationId}
                  notification={notification}
                />
              ))}
            </Stack>
          )}

          {/* Footer */}
          <Button
            variant="light"
            fullWidth
            rightSection={<IconArrowRight size={16} />}
            onClick={() => {
              setOpened(false);
              navigate('/notifications');
            }}
          >
            View all notifications
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};
