using System;
using System.Collections.Generic;

namespace LearningApp.Domain
{
    public class ChatConversation
    {
        public int ChatConversationId { get; set; }
        public int CourseId { get; set; }
        public int StudentId { get; set; }
        public int? AdminId { get; set; } // Optional, assigned when admin joins
        public string Title { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public bool IsActive { get; set; }
        public int UnreadStudentCount { get; set; }
        public int UnreadAdminCount { get; set; }
        public DateTime? LastMessageAt { get; set; }

        // Navigation properties
        public virtual Course Course { get; set; }
        public virtual Users Student { get; set; }
        public virtual Users Admin { get; set; }
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
        public virtual ICollection<ChatConversationParticipant> Participants { get; set; } = new List<ChatConversationParticipant>();
    }
}
