using System;

namespace LearningApp.Application.DTOs;

public class StudentProjectEnrollmentDto
{
    public int ProjectEnrollmentId { get; set; }

    public int StudentId { get; set; }

    public int MiniProjectId { get; set; }

    public DateTime EnrollmentDate { get; set; }

    public string Status { get; set; } = null!; // active, paused, completed, submitted

    public int ProgressPercentage { get; set; } // 0-100

    public string? GitRepositoryUrl { get; set; }

    public DateTime? SubmissionDate { get; set; }

    public string? SubmissionNotes { get; set; }
}

public class CreateStudentProjectEnrollmentDto
{
    public int StudentId { get; set; }

    public int MiniProjectId { get; set; }
}

public class UpdateStudentProjectEnrollmentDto
{
    public string? Status { get; set; }

    public int? ProgressPercentage { get; set; }

    public string? GitRepositoryUrl { get; set; }

    public DateTime? SubmissionDate { get; set; }

    public string? SubmissionNotes { get; set; }
}
