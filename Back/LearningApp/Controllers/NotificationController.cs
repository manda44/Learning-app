using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LearningApp.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Get all notifications for a user
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetUserNotifications(int userId, [FromQuery] bool unreadOnly = false)
        {
            try
            {
                var notifications = await _notificationService.GetUserNotificationsAsync(userId, unreadOnly);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get unread notification count for a user
        /// </summary>
        [HttpGet("user/{userId}/unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount(int userId)
        {
            try
            {
                var count = await _notificationService.GetUnreadCountAsync(userId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Create a new notification
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] CreateNotificationDto dto)
        {
            try
            {
                var notification = await _notificationService.CreateNotificationAsync(dto);
                return CreatedAtAction(nameof(GetUnreadCount), new { userId = notification.UserId }, notification);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Mark a notification as read
        /// </summary>
        [HttpPut("{notificationId}/mark-as-read")]
        public async Task<ActionResult<NotificationDto>> MarkAsRead(int notificationId)
        {
            try
            {
                var notification = await _notificationService.MarkAsReadAsync(notificationId);
                return Ok(notification);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Mark all notifications as read for a user
        /// </summary>
        [HttpPut("user/{userId}/mark-all-as-read")]
        public async Task<ActionResult> MarkAllAsRead(int userId)
        {
            try
            {
                var result = await _notificationService.MarkAllAsReadAsync(userId);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{notificationId}")]
        public async Task<ActionResult> DeleteNotification(int notificationId)
        {
            try
            {
                var result = await _notificationService.DeleteNotificationAsync(notificationId);
                if (!result)
                {
                    return NotFound(new { message = "Notification not found" });
                }
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get notification preferences for a user
        /// </summary>
        [HttpGet("preferences/{userId}")]
        public async Task<ActionResult<IEnumerable<NotificationPreferenceDto>>> GetUserPreferences(int userId)
        {
            try
            {
                var preferences = await _notificationService.GetUserPreferencesAsync(userId);
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update notification preference
        /// </summary>
        [HttpPut("preferences/{userId}/{notificationType}")]
        public async Task<ActionResult<NotificationPreferenceDto>> UpdatePreference(int userId, string notificationType, [FromBody] UpdatePreferenceDto dto)
        {
            try
            {
                var preference = await _notificationService.UpdatePreferenceAsync(userId, notificationType, dto.IsEnabled, dto.DeliveryMethod);
                return Ok(preference);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class UpdatePreferenceDto
    {
        public bool IsEnabled { get; set; }
        public string DeliveryMethod { get; set; }
    }
}
