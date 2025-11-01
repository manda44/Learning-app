using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class CourseMiniProject
{
    public int CourseMiniProjectId { get; set; }

    public int CourseId { get; set; }

    public int MiniProjectId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual MiniProject MiniProject { get; set; } = null!;
}
