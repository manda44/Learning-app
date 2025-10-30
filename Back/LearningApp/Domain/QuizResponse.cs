using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class QuizResponse
{
    public int QuizResponseId { get; set; }

    public int UserId { get; set; }

    public int QuizId { get; set; }

    public int AttemptNumber { get; set; }

    public DateTime ResponseDate { get; set; }

    public int? Score { get; set; }

    public virtual ICollection<QuestionResponse> QuestionResponses { get; set; } = new List<QuestionResponse>();

    public virtual Quiz Quiz { get; set; } = null!;

    public virtual Users User { get; set; } = null!;
}
