using System;
using System.Collections.Generic;

namespace LearningApp.Application.DTOs;

/// <summary>
/// DTO for displaying complete chapter details to students
/// Includes all content blocks within the chapter
/// </summary>
public class ChapterDetailDto
{
    // Chapter Information
    public int ChapterId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int Order { get; set; }
    public string Color { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public int CourseId { get; set; }

    // Course Information (for navigation)
    public string? CourseTitle { get; set; }

    // Content Blocks (ordered)
    public List<ContentBlockDto> ContentBlocks { get; set; } = new();

    // Student Progress Information
    public StudentChapterProgressDto? StudentProgress { get; set; }
}

/// <summary>
/// DTO for individual content blocks within a chapter
/// </summary>
public class ContentBlockDto
{
    public int ContentId { get; set; }
    public string Type { get; set; } = null!; // "text", "video", "image", "heading", etc.
    public string? Data { get; set; } // Content data (can be JSON for structured content)
    public int Order { get; set; } // Display order
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for listing chapters in a course (student view)
/// </summary>
public class ChapterListItemDto
{
    public int ChapterId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int Order { get; set; }
    public string Color { get; set; } = null!;
    public int ContentCount { get; set; } // Number of content blocks
    public bool HasQuiz { get; set; } // Whether chapter has quiz
    public int? QuizId { get; set; } // ID of quiz if HasQuiz is true
    public StudentChapterProgressDto? StudentProgress { get; set; }
}

/// <summary>
/// DTO for quiz item in course navigation (student view)
/// </summary>
public class QuizItemDto
{
    public int QuizId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int ChapterId { get; set; }
    public int Order { get; set; } // Order after the chapter
    public int SuccessPercentage { get; set; }
}
