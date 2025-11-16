using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace LearningApp.Application.DTOs
{
    public class ChatConversationDto
    {
        [JsonPropertyName("chatConversationId")]
        public int ChatConversationId { get; set; }

        [JsonPropertyName("courseId")]
        public int CourseId { get; set; }

        [JsonPropertyName("studentId")]
        public int StudentId { get; set; }

        [JsonPropertyName("adminId")]
        public int? AdminId { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("closedAt")]
        public DateTime? ClosedAt { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }

        [JsonPropertyName("unreadStudentCount")]
        public int UnreadStudentCount { get; set; }

        [JsonPropertyName("unreadAdminCount")]
        public int UnreadAdminCount { get; set; }

        [JsonPropertyName("lastMessageAt")]
        public DateTime? LastMessageAt { get; set; }

        // Related data
        [JsonPropertyName("studentName")]
        public string StudentName { get; set; }

        [JsonPropertyName("adminName")]
        public string AdminName { get; set; }

        [JsonPropertyName("courseName")]
        public string CourseName { get; set; }

        [JsonPropertyName("totalMessages")]
        public int TotalMessages { get; set; }
    }

    public class CreateChatConversationDto
    {
        public int CourseId { get; set; }
        public int StudentId { get; set; }
        public string Title { get; set; }
    }

    public class UpdateChatConversationDto
    {
        public string Title { get; set; }
        public bool IsActive { get; set; }
    }
}
