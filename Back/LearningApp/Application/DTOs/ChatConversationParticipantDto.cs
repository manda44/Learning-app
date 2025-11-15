using System;

namespace LearningApp.Application.DTOs
{
    public class ChatConversationParticipantDto
    {
        public int ChatConversationParticipantId { get; set; }
        public int ChatConversationId { get; set; }
        public int UserId { get; set; }
        public string Role { get; set; } // "student" or "admin"
        public DateTime JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }
        public DateTime? LastReadAt { get; set; }
        public bool IsActive { get; set; }

        // Related data
        public string UserName { get; set; }
        public string UserEmail { get; set; }
    }

    public class CreateChatConversationParticipantDto
    {
        public int ChatConversationId { get; set; }
        public int UserId { get; set; }
        public string Role { get; set; }
    }

    public class UpdateChatConversationParticipantDto
    {
        public DateTime? LastReadAt { get; set; }
        public bool? IsActive { get; set; }
    }
}
