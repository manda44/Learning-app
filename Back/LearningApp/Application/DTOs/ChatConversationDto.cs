using System;
using System.Collections.Generic;

namespace LearningApp.Application.DTOs
{
    public class ChatConversationDto
    {
        public int ChatConversationId { get; set; }
        public int CourseId { get; set; }
        public int StudentId { get; set; }
        public int? AdminId { get; set; }
        public string Title { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public bool IsActive { get; set; }
        public int UnreadStudentCount { get; set; }
        public int UnreadAdminCount { get; set; }
        public DateTime? LastMessageAt { get; set; }

        // Related data
        public string StudentName { get; set; }
        public string AdminName { get; set; }
        public string CourseName { get; set; }
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
