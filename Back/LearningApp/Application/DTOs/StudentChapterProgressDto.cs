using System;

namespace LearningApp.Application.DTOs;

public class StudentChapterProgressDto
{
    public int ChapterProgressId { get; set; }

    public int StudentId { get; set; }

    public int ChapterId { get; set; }

    public DateTime StartedDate { get; set; }

    public DateTime? CompletedDate { get; set; }

    public string Status { get; set; } = null!; // not_started, in_progress, completed

    public int ProgressPercentage { get; set; } // 0-100
}

public class CreateStudentChapterProgressDto
{
    public int StudentId { get; set; }

    public int ChapterId { get; set; }
}

public class UpdateStudentChapterProgressDto
{
    public string? Status { get; set; }

    public int? ProgressPercentage { get; set; }

    public DateTime? CompletedDate { get; set; }
}

public class ChapterWithLockStatusDto
{
    public int ChapterId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int Order { get; set; }
    public string Color { get; set; } = null!;
    public bool IsLocked { get; set; }
    public bool IsCompleted { get; set; }
    public bool HasQuiz { get; set; }
    public int? QuizId { get; set; }
    public bool QuizPassed { get; set; }
    public bool QuizLocked { get; set; }
    public int? LastQuizScore { get; set; }
    public int ProgressPercentage { get; set; }
}
