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

    // Pour les réponses ouvertes - informations de grading
    public List<string>? ExpectedKeywords { get; set; } // Mots-clés attendus (extraits de la réponse modèle)

    public List<string>? FoundKeywords { get; set; } // Mots-clés trouvés dans la réponse étudiant

    public int? MatchPercentage { get; set; } // Pourcentage de mots-clés trouvés
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
