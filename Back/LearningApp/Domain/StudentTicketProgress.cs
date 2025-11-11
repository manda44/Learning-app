using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class StudentTicketProgress
{
    public int TicketProgressId { get; set; }

    public int StudentId { get; set; }

    public int TicketId { get; set; }

    public DateTime? StartedDate { get; set; }

    public DateTime? CompletedDate { get; set; }

    public string Status { get; set; } = null!; // pending, in_progress, completed, blocked

    public int ProgressPercentage { get; set; } // 0-100

    public string? Notes { get; set; }

    public virtual Users Student { get; set; } = null!;

    public virtual Ticket Ticket { get; set; } = null!;
}
