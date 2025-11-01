using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class StudentQuizAttempt
{
    public int QuizAttemptId { get; set; }

    public int StudentId { get; set; }

    public int QuizId { get; set; }

    public int? ChapterProgressId { get; set; }

    public int AttemptNumber { get; set; } // Default: 1

    public DateTime AttemptDate { get; set; }

    public int? Score { get; set; } // Pourcentage (0-100)

    public string Status { get; set; } = null!; // in_progress, passed, failed

    public int? TimeSpentSeconds { get; set; }

    public virtual StudentChapterProgress? ChapterProgress { get; set; }

    public virtual Quiz Quiz { get; set; } = null!;

    public virtual Users Student { get; set; } = null!;

    public virtual ICollection<StudentQuestionResponse> StudentQuestionResponses { get; set; } = new List<StudentQuestionResponse>();
}
