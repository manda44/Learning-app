using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class Ticket
{
    public int TicketId { get; set; }

    public int MiniProjectId { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public string? Status { get; set; } // e.g., "pending", "in_progress", "completed"

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual MiniProject MiniProject { get; set; } = null!;
}
