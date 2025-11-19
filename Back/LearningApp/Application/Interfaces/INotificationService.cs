using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LearningApp.Application.DTOs;

namespace LearningApp.Application.Interfaces
{
    public interface INotificationService
    {
        // Get all notifications for a user
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false);

        // Get unread notification count
        Task<int> GetUnreadCountAsync(int userId);

        // Create notification
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto);

        // Mark notification as read
        Task<NotificationDto> MarkAsReadAsync(int notificationId);

        // Mark all notifications as read for user
        Task<bool> MarkAllAsReadAsync(int userId);

        // Delete notification
        Task<bool> DeleteNotificationAsync(int notificationId);

        // Get notification preferences
        Task<IEnumerable<NotificationPreferenceDto>> GetUserPreferencesAsync(int userId);

        // Update notification preference
        Task<NotificationPreferenceDto> UpdatePreferenceAsync(int userId, string notificationType, bool isEnabled, string deliveryMethod = "InApp");
    }
}
