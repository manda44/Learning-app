using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class StudentProjectEnrollment
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

    public virtual MiniProject MiniProject { get; set; } = null!;

    public virtual Users Student { get; set; } = null!;

    public virtual ICollection<StudentTicketProgress> StudentTicketProgresses { get; set; } = new List<StudentTicketProgress>();
}
