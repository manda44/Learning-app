using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class Course
{
    public int CourseId { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int UserId { get; set; }

    public virtual ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();

    public virtual Users User { get; set; } = null!;

    public virtual ICollection<MiniProject> MiniProjects { get; set; } = new List<MiniProject>();

    public virtual ICollection<StudentCourseEnrollment> StudentCourseEnrollments { get; set; } = new List<StudentCourseEnrollment>();

    public virtual ICollection<ChatConversation> ChatConversations { get; set; } = new List<ChatConversation>();
}
