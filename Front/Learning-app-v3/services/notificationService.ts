import apiClient from './apiClient';
import type { NotificationDto, NotificationPreferenceDto } from '../types/notification';

export const notificationService = {
  // Get all user notifications
  async getUserNotifications(userId: number, unreadOnly: boolean = false) {
    const response = await apiClient.get<NotificationDto[]>(
      `/notifications/user/${userId}?unreadOnly=${unreadOnly}`
    );
    return response.data;
  },

  // Get unread notification count
  async getUnreadCount(userId: number) {
    const response = await apiClient.get<number>(
      `/notifications/user/${userId}/unread-count`
    );
    return response.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: number) {
    const response = await apiClient.put<NotificationDto>(
      `/notifications/${notificationId}/mark-as-read`
    );
    return response.data;
  },

  // Mark all notifications as read
  async markAllAsRead(userId: number) {
    const response = await apiClient.put(
      `/notifications/user/${userId}/mark-all-as-read`
    );
    return response.data;
  },

  // Delete notification
  async deleteNotification(notificationId: number) {
    const response = await apiClient.delete(
      `/notifications/${notificationId}`
    );
    return response.data;
  },

  // Get user preferences
  async getUserPreferences(userId: number) {
    const response = await apiClient.get<NotificationPreferenceDto[]>(
      `/notifications/preferences/${userId}`
    );
    return response.data;
  },

  // Update notification preference
  async updatePreference(
    userId: number,
    notificationType: string,
    enabled: boolean,
    deliveryMethod?: string
  ) {
    const response = await apiClient.put<NotificationPreferenceDto>(
      `/notifications/preferences/${userId}/${notificationType}`,
      {
        isEnabled: enabled,
        deliveryMethod: deliveryMethod,
      }
    );
    return response.data;
  },
};
