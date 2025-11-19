using System;

namespace LearningApp.Domain
{
    public class NotificationPreference
    {
        public int PreferenceId { get; set; }
        public int UserId { get; set; }
        public string NotificationType { get; set; } // "TicketCompleted", "CourseFinished", "CourseStarted", "Message", "TicketValidated"
        public bool IsEnabled { get; set; }
        public string DeliveryMethod { get; set; } // "InApp", "Email", "Both"
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation property
        public virtual Users User { get; set; }
    }
}
