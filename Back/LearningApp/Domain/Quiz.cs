using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class Quiz
{
    public int QuizId { get; set; }

    public int ChapterId { get; set; }

    public string Title { get; set; } = null!;

    public virtual Chapter Chapter { get; set; } = null!;

    public int SuccessPercentage { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Description { get; set; }
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();

    public virtual ICollection<QuizResponse> QuizResponses { get; set; } = new List<QuizResponse>();
}
