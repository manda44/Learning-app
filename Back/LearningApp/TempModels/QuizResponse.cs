using System;
using System.Collections.Generic;

namespace LearningApp.TempModels;

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

    public virtual User User { get; set; } = null!;
}
