using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class StudentQuestionResponse
{
    public int QuestionResponseId { get; set; }

    public int QuizAttemptId { get; set; }

    public int QuestionId { get; set; }

    public int? QuestionItemId { get; set; }

    public string? ResponseContent { get; set; } // Pour les réponses ouvertes

    public bool? IsCorrect { get; set; }

    public virtual Question Question { get; set; } = null!;

    public virtual QuestionItem? QuestionItem { get; set; }

    public virtual StudentQuizAttempt QuizAttempt { get; set; } = null!;
}
