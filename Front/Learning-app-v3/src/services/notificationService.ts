const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

const getToken = () => localStorage.getItem('authToken');

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

export interface Notification {
  notificationId: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface NotificationPreference {
  preferenceId: number;
  userId: number;
  notificationType: string;
  isEnabled: boolean;
  deliveryMethod: string;
}

export const notificationService = {
  // Get all user notifications
  async getUserNotifications(userId: number, unreadOnly: boolean = false) {
    return fetchWithAuth(
      `${API_URL}/notifications/user/${userId}?unreadOnly=${unreadOnly}`
    );
  },

  // Get unread notification count
  async getUnreadCount(userId: number) {
    return fetchWithAuth(
      `${API_URL}/notifications/user/${userId}/unread-count`
    );
  },

  // Create notification
  async createNotification(notification: {
    userId: number;
    type: string;
    title: string;
    message: string;
    relatedEntityId?: number;
    relatedEntityType?: string;
  }) {
    return fetchWithAuth(
      `${API_URL}/notifications`,
      {
        method: 'POST',
        body: JSON.stringify(notification),
      }
    );
  },

  // Mark notification as read
  async markAsRead(notificationId: number) {
    return fetchWithAuth(
      `${API_URL}/notifications/${notificationId}/mark-as-read`,
      { method: 'PUT' }
    );
  },

  // Mark all notifications as read
  async markAllAsRead(userId: number) {
    return fetchWithAuth(
      `${API_URL}/notifications/user/${userId}/mark-all-as-read`,
      { method: 'PUT' }
    );
  },

  // Delete notification
  async deleteNotification(notificationId: number) {
    return fetchWithAuth(
      `${API_URL}/notifications/${notificationId}`,
      { method: 'DELETE' }
    );
  },

  // Get user preferences
  async getUserPreferences(userId: number) {
    return fetchWithAuth(
      `${API_URL}/notifications/preferences/${userId}`
    );
  },

  // Update notification preference
  async updatePreference(
    userId: number,
    notificationType: string,
    enabled: boolean,
    deliveryMethod?: string
  ) {
    return fetchWithAuth(
      `${API_URL}/notifications/preferences/${userId}/${notificationType}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          isEnabled: enabled,
          deliveryMethod: deliveryMethod || 'InApp',
        }),
      }
    );
  },
};
