using System;

namespace LearningApp.Application.DTOs;

public class StudentTicketProgressDto
{
    public int TicketProgressId { get; set; }

    public int StudentId { get; set; }

    public int TicketId { get; set; }

    public DateTime? StartedDate { get; set; }

    public DateTime? CompletedDate { get; set; }

    public string Status { get; set; } = null!; // pending, in_progress, completed, validated

    public int ProgressPercentage { get; set; } // 0-100

    public string? Notes { get; set; }

    public TicketBasicDto? Ticket { get; set; }
}

public class CreateStudentTicketProgressDto
{
    public int StudentId { get; set; }

    public int TicketId { get; set; }
}

public class UpdateStudentTicketProgressDto
{
    public string? Status { get; set; }

    public int? ProgressPercentage { get; set; }

    public DateTime? StartedDate { get; set; }

    public DateTime? CompletedDate { get; set; }

    public string? Notes { get; set; }
}
