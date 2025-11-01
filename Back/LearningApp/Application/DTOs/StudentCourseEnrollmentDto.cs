using System;

namespace LearningApp.Application.DTOs;

public class StudentCourseEnrollmentDto
{
    public int EnrollmentId { get; set; }

    public int StudentId { get; set; }

    public int CourseId { get; set; }

    public DateTime EnrollmentDate { get; set; }

    public string Status { get; set; } = null!; // active, paused, completed, dropped

    public int ProgressPercentage { get; set; } // 0-100

    public DateTime? CompletionDate { get; set; }
}

public class CreateStudentCourseEnrollmentDto
{
    public int StudentId { get; set; }

    public int CourseId { get; set; }
}

public class UpdateStudentCourseEnrollmentDto
{
    public string? Status { get; set; }

    public int? ProgressPercentage { get; set; }

    public DateTime? CompletionDate { get; set; }
}
