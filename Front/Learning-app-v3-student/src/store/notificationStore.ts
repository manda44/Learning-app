import { create } from 'zustand';
import type { NotificationDto, NotificationPreferenceDto } from '../types/notification';
import { notificationService } from '../services/notificationService';

interface NotificationState {
  notifications: NotificationDto[];
  unreadCount: number;
  preferences: NotificationPreferenceDto[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: (userId: number, unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: (userId: number) => Promise<void>;
  fetchPreferences: (userId: number) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: (userId: number) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  updatePreference: (
    userId: number,
    notificationType: string,
    enabled: boolean,
    deliveryMethod?: string
  ) => Promise<void>;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  preferences: [],
  isLoading: false,
  error: null,

  fetchNotifications: async (userId: number, unreadOnly = false) => {
    try {
      set({ isLoading: true, error: null });
      const notifications = await notificationService.getUserNotifications(
        userId,
        unreadOnly
      );
      console.log(`[Notification Store] Fetched ${notifications.length} notifications for user ${userId}`);
      set({ notifications });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      console.error(`[Notification Store] Error fetching notifications: ${errorMessage}`);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async (userId: number) => {
    try {
      const count = await notificationService.getUnreadCount(userId);
      set({ unreadCount: count });
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  },

  fetchPreferences: async (userId: number) => {
    try {
      set({ isLoading: true, error: null });
      const preferences = await notificationService.getUserPreferences(userId);
      set({ preferences });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preferences';
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.notificationId === notificationId
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark notification as read';
      set({ error: errorMessage });
    }
  },

  markAllAsRead: async (userId: number) => {
    try {
      await notificationService.markAllAsRead(userId);
      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark all as read';
      set({ error: errorMessage });
    }
  },

  deleteNotification: async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      set((state) => {
        const notification = state.notifications.find(
          (n) => n.notificationId === notificationId
        );
        return {
          notifications: state.notifications.filter(
            (n) => n.notificationId !== notificationId
          ),
          unreadCount: !notification?.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      set({ error: errorMessage });
    }
  },

  updatePreference: async (
    userId: number,
    notificationType: string,
    enabled: boolean,
    deliveryMethod?: string
  ) => {
    try {
      await notificationService.updatePreference(
        userId,
        notificationType,
        enabled,
        deliveryMethod
      );
      set((state) => ({
        preferences: state.preferences.map((pref) =>
          pref.notificationType === notificationType
            ? {
                ...pref,
                isEnabled: enabled,
                deliveryMethod: deliveryMethod || pref.deliveryMethod,
              }
            : pref
        ),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preference';
      set({ error: errorMessage });
    }
  },

  clearError: () => set({ error: null }),
}));
