using System;
using System.Collections.Generic;

namespace LearningApp.TempModels;

public partial class Content
{
    public int ContentId { get; set; }

    public string Type { get; set; } = null!;

    public string? Data { get; set; }

    public int Order { get; set; }

    public DateTime CreatedAt { get; set; }

    public int ChapterId { get; set; }

    public virtual Chapter Chapter { get; set; } = null!;
}
