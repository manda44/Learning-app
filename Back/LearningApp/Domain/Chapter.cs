using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class Chapter
{
    public int ChapterId { get; set; }

    public string Title { get; set; } = null!;

    public int Order_ { get; set; }

    public DateTime CreatedAd { get; set; }

    public int CourseId { get; set; }

    public string? Description { get; set; }

    public string Color { get; set; } = null!;

    public virtual ICollection<Content> Contents { get; set; } = new List<Content>();

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}
