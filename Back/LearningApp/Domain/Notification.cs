using System;

namespace LearningApp.Domain
{
    public class Notification
    {
        public int NotificationId { get; set; }
        public int UserId { get; set; }
        public string Type { get; set; } // "TicketCompleted", "CourseFinished", "CourseStarted", "Message", "TicketValidated"
        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }

        // Reference to the entity that triggered the notification (optional)
        public int? RelatedEntityId { get; set; } // TicketId, CourseId, ChatConversationId, etc.
        public string RelatedEntityType { get; set; } // "Ticket", "Course", "Chat", etc.

        // Navigation property
        public virtual Users User { get; set; }
    }
}
