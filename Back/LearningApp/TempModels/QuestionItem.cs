using System;
using System.Collections.Generic;

namespace LearningApp.TempModels;

public partial class QuestionItem
{
    public int QuestionItemId { get; set; }

    public int QuestionId { get; set; }

    public string? Content { get; set; }

    public bool? IsRight { get; set; }

    public string? RightResponse { get; set; }

    public virtual Question Question { get; set; } = null!;

    public virtual ICollection<QuestionResponse> QuestionResponses { get; set; } = new List<QuestionResponse>();
}
