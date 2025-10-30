using System;
using System.Collections.Generic;

namespace LearningApp.TempModels;

public partial class MiniProject
{
    public int MiniProjectId { get; set; }

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
}
