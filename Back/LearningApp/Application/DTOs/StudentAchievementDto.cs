using System;

namespace LearningApp.Application.DTOs;

public class StudentAchievementDto
{
    public int AchievementId { get; set; }

    public int StudentId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string AchievementType { get; set; } = null!; // quiz_passed, chapter_completed, course_completed, perfect_score, etc.

    public int Points { get; set; }

    public DateTime UnlockedDate { get; set; }

    public string? RelatedEntityType { get; set; } // Course, Quiz, Project, etc.

    public int? RelatedEntityId { get; set; }
}

public class CreateStudentAchievementDto
{
    public int StudentId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string AchievementType { get; set; } = null!;

    public int Points { get; set; }

    public string? RelatedEntityType { get; set; }

    public int? RelatedEntityId { get; set; }
}

public class UpdateStudentAchievementDto
{
    public string? Title { get; set; }

    public string? Description { get; set; }

    public int? Points { get; set; }
}
