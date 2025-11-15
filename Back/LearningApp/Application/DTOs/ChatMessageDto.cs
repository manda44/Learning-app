using System;
using System.Collections.Generic;

namespace LearningApp.Application.DTOs
{
    public class ChatMessageDto
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

        // Related data
        public string SenderName { get; set; }
        public string SenderEmail { get; set; }
        public List<ChatMessageAttachmentDto> Attachments { get; set; } = new();
    }

    public class CreateChatMessageDto
    {
        public int ChatConversationId { get; set; }
        public int SenderId { get; set; }
        public string Content { get; set; }
    }

    public class UpdateChatMessageDto
    {
        public string Content { get; set; }
    }

    public class ChatMessageWithAttachmentsDto
    {
        public ChatMessageDto Message { get; set; }
        public List<ChatMessageAttachmentDto> Attachments { get; set; } = new();
    }
}
