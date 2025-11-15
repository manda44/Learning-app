using System;
using System.Collections.Generic;

namespace LearningApp.Domain
{
    public class ChatMessage
    {
        public int ChatMessageId { get; set; }
        public int ChatConversationId { get; set; }
        public int SenderId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsEdited { get; set; }
        public DateTime? EditedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        public virtual ChatConversation ChatConversation { get; set; }
        public virtual Users Sender { get; set; }
        public virtual ICollection<ChatMessageAttachment> Attachments { get; set; } = new List<ChatMessageAttachment>();
    }
}
