using System;
using System.Collections.Generic;

namespace LearningApp.Application.DTOs;

public class StudentQuizAttemptDto
{
    public int QuizAttemptId { get; set; }

    public int StudentId { get; set; }

    public int QuizId { get; set; }

    public int? ChapterProgressId { get; set; }

    public int AttemptNumber { get; set; }

    public DateTime AttemptDate { get; set; }

    public int? Score { get; set; } // Pourcentage (0-100)

    public string Status { get; set; } = null!; // in_progress, passed, failed

    public int? TimeSpentSeconds { get; set; }

    public ICollection<StudentQuestionResponseDto> StudentQuestionResponses { get; set; } = new List<StudentQuestionResponseDto>();
}

public class CreateStudentQuizAttemptDto
{
    public int StudentId { get; set; }

    public int QuizId { get; set; }

    public int? ChapterProgressId { get; set; }
}

public class UpdateStudentQuizAttemptDto
{
    public int? Score { get; set; }

    public string? Status { get; set; }

    public int? TimeSpentSeconds { get; set; }
}
