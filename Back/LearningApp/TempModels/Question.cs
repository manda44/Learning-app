using System;
using System.Collections.Generic;

namespace LearningApp.TempModels;

public partial class Question
{
    public int QuestionId { get; set; }

    public int QuizId { get; set; }

    public string Type { get; set; } = null!;

    public string Content { get; set; } = null!;

    public int Rank { get; set; }

    public string? Explanation { get; set; }

    public virtual ICollection<QuestionItem> QuestionItems { get; set; } = new List<QuestionItem>();

    public virtual ICollection<QuestionResponse> QuestionResponses { get; set; } = new List<QuestionResponse>();

    public virtual Quiz Quiz { get; set; } = null!;
}
