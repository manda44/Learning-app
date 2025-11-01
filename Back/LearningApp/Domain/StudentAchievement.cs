using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class StudentAchievement
{
    public int AchievementId { get; set; }

    public int StudentId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string AchievementType { get; set; } = null!; // quiz_passed, chapter_completed, course_completed, perfect_score, etc.

    public int Points { get; set; } // Default: 0

    public DateTime UnlockedDate { get; set; }

    public string? RelatedEntityType { get; set; } // Course, Quiz, Project, etc.

    public int? RelatedEntityId { get; set; }

    public virtual Users Student { get; set; } = null!;
}
