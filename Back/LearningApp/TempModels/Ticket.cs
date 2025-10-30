using System;
using System.Collections.Generic;

namespace LearningApp.TempModels;

public partial class Ticket
{
    public int TicketId { get; set; }

    public int MiniProjectId { get; set; }

    public virtual MiniProject MiniProject { get; set; } = null!;
}
