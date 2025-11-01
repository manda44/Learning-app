using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class StudentChapterProgress
{
    public int ChapterProgressId { get; set; }

    public int StudentId { get; set; }

    public int ChapterId { get; set; }

    public DateTime StartedDate { get; set; }

    public DateTime? CompletedDate { get; set; }

    public string Status { get; set; } = null!; // not_started, in_progress, completed

    public int ProgressPercentage { get; set; } // 0-100

    public virtual Chapter Chapter { get; set; } = null!;

    public virtual Users Student { get; set; } = null!;

    public virtual ICollection<StudentQuizAttempt> StudentQuizAttempts { get; set; } = new List<StudentQuizAttempt>();
}
