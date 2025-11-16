using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace LearningApp.Application.DTOs
{
    public class ChatMessageDto
    {
        [JsonPropertyName("chatMessageId")]
        public int ChatMessageId { get; set; }

        [JsonPropertyName("chatConversationId")]
        public int ChatConversationId { get; set; }

        [JsonPropertyName("senderId")]
        public int SenderId { get; set; }

        [JsonPropertyName("content")]
        public string Content { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("isEdited")]
        public bool IsEdited { get; set; }

        [JsonPropertyName("editedAt")]
        public DateTime? EditedAt { get; set; }

        [JsonPropertyName("isDeleted")]
        public bool IsDeleted { get; set; }

        [JsonPropertyName("deletedAt")]
        public DateTime? DeletedAt { get; set; }

        // Related data
        [JsonPropertyName("senderName")]
        public string SenderName { get; set; }

        [JsonPropertyName("senderEmail")]
        public string SenderEmail { get; set; }

        [JsonPropertyName("attachments")]
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
