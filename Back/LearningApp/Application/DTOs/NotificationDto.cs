using System;
using System.Text.Json.Serialization;

namespace LearningApp.Application.DTOs
{
    public class NotificationDto
    {
        [JsonPropertyName("notificationId")]
        public int NotificationId { get; set; }

        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; }

        [JsonPropertyName("isRead")]
        public bool IsRead { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("readAt")]
        public DateTime? ReadAt { get; set; }

        [JsonPropertyName("relatedEntityId")]
        public int? RelatedEntityId { get; set; }

        [JsonPropertyName("relatedEntityType")]
        public string RelatedEntityType { get; set; }
    }

    public class CreateNotificationDto
    {
        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; }

        [JsonPropertyName("relatedEntityId")]
        public int? RelatedEntityId { get; set; }

        [JsonPropertyName("relatedEntityType")]
        public string RelatedEntityType { get; set; }
    }

    public class NotificationPreferenceDto
    {
        [JsonPropertyName("preferenceId")]
        public int PreferenceId { get; set; }

        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        [JsonPropertyName("notificationType")]
        public string NotificationType { get; set; }

        [JsonPropertyName("isEnabled")]
        public bool IsEnabled { get; set; }

        [JsonPropertyName("deliveryMethod")]
        public string DeliveryMethod { get; set; } // "InApp", "Email", "Both"
    }
}
