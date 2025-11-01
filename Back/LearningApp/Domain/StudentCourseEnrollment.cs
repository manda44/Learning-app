using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class StudentCourseEnrollment
{
    public int EnrollmentId { get; set; }

    public int StudentId { get; set; }

    public int CourseId { get; set; }

    public DateTime EnrollmentDate { get; set; }

    public string Status { get; set; } = null!; // active, paused, completed, dropped

    public int ProgressPercentage { get; set; } // 0-100

    public DateTime? CompletionDate { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Users Student { get; set; } = null!;
}
