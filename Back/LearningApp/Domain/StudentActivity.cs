using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class StudentActivity
{
    public int ActivityId { get; set; }

    public int StudentId { get; set; }

    public string ActivityType { get; set; } = null!; // course_started, chapter_opened, quiz_completed, project_started, ticket_completed, etc.

    public DateTime ActivityDate { get; set; }

    public string RelatedEntityType { get; set; } = null!; // Course, Chapter, Quiz, Project, Ticket

    public int RelatedEntityId { get; set; }

    public string? Details { get; set; }

    public virtual Users Student { get; set; } = null!;
}
