using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class MiniProject
{
    public int MiniProjectId { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int CourseId { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

    public virtual ICollection<StudentProjectEnrollment> StudentProjectEnrollments { get; set; } = new List<StudentProjectEnrollment>();
}
