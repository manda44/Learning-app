using System;

namespace LearningApp.Domain
{
    public class ChatConversationParticipant
    {
        public int ChatConversationParticipantId { get; set; }
        public int ChatConversationId { get; set; }
        public int UserId { get; set; }
        public string Role { get; set; } // "student" or "admin"
        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }
        public DateTime? LastReadAt { get; set; }
        public bool IsActive { get; set; }

        // Navigation properties
        public virtual ChatConversation ChatConversation { get; set; }
        public virtual Users User { get; set; }
    }
}
