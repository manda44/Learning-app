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
