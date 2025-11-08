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

public class SubmitQuizAttemptDto
{
    public int TimeSpentSeconds { get; set; }

    public List<SubmitQuestionAnswerDto> Answers { get; set; } = new List<SubmitQuestionAnswerDto>();
}

public class SubmitQuestionAnswerDto
{
    public int QuestionId { get; set; }

    public List<int>? QuestionItemIds { get; set; } // Pour MCQ et UNIQUECHOICE

    public string? ResponseContent { get; set; } // Pour OPENRESPONSE
}

public class SubmitQuizDto
{
    public int StudentId { get; set; }

    public int QuizId { get; set; }

    public int TimeSpentSeconds { get; set; }

    public List<SubmitQuestionAnswerDto> Answers { get; set; } = new List<SubmitQuestionAnswerDto>();
}
