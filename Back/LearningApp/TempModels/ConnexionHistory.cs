using System;
using System.Collections.Generic;

namespace LearningApp.TempModels;

public partial class ConnexionHistory
{
    public int ConnexionHistoryId { get; set; }

    public DateTime? ConnexionDate { get; set; }

    public int UserId { get; set; }

    public virtual User User { get; set; } = null!;
}
