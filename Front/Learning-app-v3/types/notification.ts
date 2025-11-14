export interface NotificationDto {
  notificationId: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  priority?: number;
  metadata?: string;
}

export interface NotificationPreferenceDto {
  preferenceId: number;
  userId: number;
  notificationType: string;
  isEnabled: boolean;
  deliveryMethod: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  templateId: number;
  type: string;
  titleTemplate: string;
  messageTemplate: string;
  defaultPriority: number;
  iconName?: string;
  colorHex?: string;
  isActive: boolean;
}

// Notification types for categorization
export enum NotificationType {
  COURSE_UPDATE = 'COURSE_UPDATE',
  ENROLLMENT_CONFIRMATION = 'ENROLLMENT_CONFIRMATION',
  QUIZ_REMINDER = 'QUIZ_REMINDER',
  GRADE_RECEIVED = 'GRADE_RECEIVED',
  PROJECT_FEEDBACK = 'PROJECT_FEEDBACK',
  ADMIN_MESSAGE = 'ADMIN_MESSAGE',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

// Notification priority levels
export enum NotificationPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  URGENT = 3,
}
