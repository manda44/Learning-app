using System;

namespace LearningApp.Application.DTOs;

/// <summary>
/// DTO that combines Course information with Student Enrollment data.
/// If a student is not enrolled in a course, enrollment fields will be empty/default values.
/// </summary>
public class CourseWithEnrollmentDto
{
    // Course Fields
    public int CourseId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int UserId { get; set; }

    // Enrollment Fields (null or empty if student not enrolled)
    public int? EnrollmentId { get; set; }
    public DateTime? EnrollmentDate { get; set; }
    public string? Status { get; set; } // active, paused, completed, dropped (null if not enrolled)
    public int? ProgressPercentage { get; set; } // 0-100, null if not enrolled
    public DateTime? CompletionDate { get; set; }

    // Flag to indicate if student is enrolled in this course
    public bool IsEnrolled { get; set; } = false;
}
