using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Application.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId, bool unreadOnly = false)
        {
            var query = _context.Notifications.Where(n => n.UserId == userId);

            if (unreadOnly)
            {
                query = query.Where(n => !n.IsRead);
            }

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return notifications.Select(MapToDto);
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .CountAsync();
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto dto)
        {
            var notification = new Notification
            {
                UserId = dto.UserId,
                Type = dto.Type,
                Title = dto.Title,
                Message = dto.Message,
                RelatedEntityId = dto.RelatedEntityId,
                RelatedEntityType = dto.RelatedEntityType,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return MapToDto(notification);
        }

        public async Task<NotificationDto> MarkAsReadAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null)
            {
                throw new KeyNotFoundException($"Notification with id {notificationId} not found");
            }

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(notification);
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null)
            {
                return false;
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<NotificationPreferenceDto>> GetUserPreferencesAsync(int userId)
        {
            var preferences = await _context.NotificationPreferences
                .Where(p => p.UserId == userId)
                .ToListAsync();

            return preferences.Select(p => new NotificationPreferenceDto
            {
                PreferenceId = p.PreferenceId,
                UserId = p.UserId,
                NotificationType = p.NotificationType,
                IsEnabled = p.IsEnabled,
                DeliveryMethod = p.DeliveryMethod
            });
        }

        public async Task<NotificationPreferenceDto> UpdatePreferenceAsync(int userId, string notificationType, bool isEnabled, string deliveryMethod = "InApp")
        {
            var preference = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId && p.NotificationType == notificationType);

            if (preference == null)
            {
                preference = new NotificationPreference
                {
                    UserId = userId,
                    NotificationType = notificationType,
                    IsEnabled = isEnabled,
                    DeliveryMethod = deliveryMethod,
                    CreatedAt = DateTime.UtcNow
                };
                _context.NotificationPreferences.Add(preference);
            }
            else
            {
                preference.IsEnabled = isEnabled;
                preference.DeliveryMethod = deliveryMethod;
                preference.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return new NotificationPreferenceDto
            {
                PreferenceId = preference.PreferenceId,
                UserId = preference.UserId,
                NotificationType = preference.NotificationType,
                IsEnabled = preference.IsEnabled,
                DeliveryMethod = preference.DeliveryMethod
            };
        }

        private NotificationDto MapToDto(Notification notification)
        {
            return new NotificationDto
            {
                NotificationId = notification.NotificationId,
                UserId = notification.UserId,
                Type = notification.Type,
                Title = notification.Title,
                Message = notification.Message,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt,
                ReadAt = notification.ReadAt,
                RelatedEntityId = notification.RelatedEntityId,
                RelatedEntityType = notification.RelatedEntityType
            };
        }
    }
}
