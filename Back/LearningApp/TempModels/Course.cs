using System;
using System.Collections.Generic;

namespace LearningApp.TempModels;

public partial class Course
{
    public int CourseId { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int UserId { get; set; }

    public virtual ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();

    public virtual User User { get; set; } = null!;

    public virtual ICollection<MiniProject> MiniProjects { get; set; } = new List<MiniProject>();
}
