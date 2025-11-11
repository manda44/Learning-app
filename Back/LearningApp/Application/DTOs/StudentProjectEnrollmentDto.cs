using System;
using System.Collections.Generic;

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

    public MiniProjectBasicDto? MiniProject { get; set; }

    public List<StudentTicketProgressDto>? TicketProgresses { get; set; }
}

public class MiniProjectBasicDto
{
    public int MiniProjectId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int CourseId { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<TicketBasicDto>? Tickets { get; set; }
}

public class TicketBasicDto
{
    public int TicketId { get; set; }
    public int MiniProjectId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
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

public class UpdateGitRepositoryDto
{
    public string GitRepositoryUrl { get; set; } = null!;
}

public class PendingValidationTicketDto
{
    public int TicketProgressId { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = null!;
    public string StudentEmail { get; set; } = null!;
    public int TicketId { get; set; }
    public string TicketTitle { get; set; } = null!;
    public string? TicketDescription { get; set; }
    public int MiniProjectId { get; set; }
    public string MiniProjectTitle { get; set; } = null!;
    public int CourseId { get; set; }
    public string CourseName { get; set; } = null!;
    public DateTime? CompletedDate { get; set; }
    public string? Notes { get; set; }
}
