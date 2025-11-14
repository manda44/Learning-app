import React, { useEffect, useState } from 'react';
import {
  Container,
  Stack,
  Group,
  Button,
  Select,
  Text,
  ThemeIcon,
  Card,
  Pagination,
  Loader,
  Center,
  TextInput,
} from '@mantine/core';
import {
  IconBell,
  IconCheck,
  IconFilterOff,
  IconSearch,
} from '@tabler/icons-react';
import { useNotificationStore } from '../../store/notificationStore';
import { NotificationItem } from '../../components/NotificationItem';
import { NotificationType } from '../../types/notification';
import { useGeneralStore } from '../../store/generalStore';

const ITEMS_PER_PAGE = 10;

export const NotificationsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId] = useState(parseInt(localStorage.getItem('userId') || '0'));

  const { setBreadCrumb } = useGeneralStore();
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAllAsRead,
  } = useNotificationStore();

  // Set breadcrumb
  useEffect(() => {
    setBreadCrumb([
      { title: 'Dashboard', href: '/' },
      { title: 'Notifications', href: '/notifications' },
    ]);
  }, [setBreadCrumb]);

  // Fetch notifications on mount
  useEffect(() => {
    if (userId) {
      fetchNotifications(userId);
    }
  }, [userId, fetchNotifications]);

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    if (filterType && notif.type !== filterType) return false;
    if (filterStatus === 'unread' && notif.isRead) return false;
    if (filterStatus === 'read' && !notif.isRead) return false;
    if (
      searchQuery &&
      !notif.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !notif.message.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleClearFilters = () => {
    setFilterType(null);
    setFilterStatus(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const typeOptions = Object.values(NotificationType).map((type) => ({
    value: type,
    label: type.replace(/_/g, ' '),
  }));

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <ThemeIcon size="lg" variant="light" color="blue">
              <IconBell size={24} />
            </ThemeIcon>
            <Stack gap={0}>
              <Text fw={600} size="lg">
                Notifications
              </Text>
              <Text size="sm" c="dimmed">
                {notifications.length} total notification
                {notifications.length !== 1 ? 's' : ''}
              </Text>
            </Stack>
          </Group>

          {unreadCount > 0 && (
            <Button
              leftSection={<IconCheck size={16} />}
              onClick={() => markAllAsRead(userId)}
              loading={isLoading}
            >
              Mark all as read ({unreadCount})
            </Button>
          )}
        </Group>

        {/* Filters */}
        <Card p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group grow>
              <TextInput
                placeholder="Search notifications..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.currentTarget.value);
                  setCurrentPage(1);
                }}
              />
              <Select
                placeholder="Filter by type"
                data={typeOptions}
                value={filterType}
                onChange={(value) => {
                  setFilterType(value);
                  setCurrentPage(1);
                }}
                clearable
              />
              <Select
                placeholder="Filter by status"
                data={[
                  { value: 'unread', label: 'Unread' },
                  { value: 'read', label: 'Read' },
                ]}
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}
                clearable
              />
            </Group>

            {(filterType || filterStatus || searchQuery) && (
              <Group justify="flex-end">
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<IconFilterOff size={14} />}
                  onClick={handleClearFilters}
                >
                  Clear filters
                </Button>
              </Group>
            )}
          </Stack>
        </Card>

        {/* Notifications List */}
        {isLoading && notifications.length === 0 ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : paginatedNotifications.length === 0 ? (
          <Card p="xl" radius="md" withBorder>
            <Center>
              <Stack gap="md" align="center">
                <ThemeIcon size="xl" variant="light" color="gray">
                  <IconBell size={32} />
                </ThemeIcon>
                <Text c="dimmed">No notifications found</Text>
              </Stack>
            </Center>
          </Card>
        ) : (
          <Stack gap="md">
            {paginatedNotifications.map((notification) => (
              <NotificationItem
                key={notification.notificationId}
                notification={notification}
              />
            ))}
          </Stack>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
            />
          </Group>
        )}
      </Stack>
    </Container>
  );
};
