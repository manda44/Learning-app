using System;

namespace LearningApp.Application.DTOs;

public class StudentQuestionResponseDto
{
    public int QuestionResponseId { get; set; }

    public int QuizAttemptId { get; set; }

    public int QuestionId { get; set; }

    public int? QuestionItemId { get; set; }

    public string? ResponseContent { get; set; } // Pour les réponses ouvertes

    public bool? IsCorrect { get; set; }
}

public class CreateStudentQuestionResponseDto
{
    public int QuizAttemptId { get; set; }

    public int QuestionId { get; set; }

    public int? QuestionItemId { get; set; }

    public string? ResponseContent { get; set; }
}

public class UpdateStudentQuestionResponseDto
{
    public int? QuestionItemId { get; set; }

    public string? ResponseContent { get; set; }
}
