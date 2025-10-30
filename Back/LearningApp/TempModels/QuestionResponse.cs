using System;
using System.Collections.Generic;

namespace LearningApp.TempModels;

public partial class QuestionResponse
{
    public int QuestionResponseId { get; set; }

    public int QuizResponseId { get; set; }

    public int QuestionId { get; set; }

    public int? QuestionItemId { get; set; }

    public string? ResponseContent { get; set; }

    public virtual Question Question { get; set; } = null!;

    public virtual QuestionItem? QuestionItem { get; set; }

    public virtual QuizResponse QuizResponse { get; set; } = null!;
}
