import React, { useState, useEffect, useRef } from 'react';
import { ActionIcon, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBell } from '@tabler/icons-react';
import { notificationService } from '../services/notificationService';
import { authService } from '../services/authService';
import { NotificationCenter } from './NotificationCenter';

interface NotificationBellProps {
  userId?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId: propUserId }) => {
  const userInfo = authService.getUserInfo();
  const user = propUserId ? { id: propUserId } : userInfo;
  const [unreadCount, setUnreadCount] = useState(0);
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const autoUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Auto-update unread count every 5 seconds when modal is closed
    autoUpdateIntervalRef.current = setInterval(() => {
      if (!opened) {
        fetchUnreadCount();
      }
    }, 5000);

    return () => {
      if (autoUpdateIntervalRef.current) {
        clearInterval(autoUpdateIntervalRef.current);
      }
    };
  }, [user, opened]);

  return (
    <>
      <div style={{ position: 'relative' }}>
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={toggle}
          title="Notifications"
        >
          <IconBell size={20} />
        </ActionIcon>
        {unreadCount > 0 && (
          <Badge
            color="red"
            circle
            size="sm"
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </div>

      <NotificationCenter opened={opened} onClose={close} />
    </>
  );
};
