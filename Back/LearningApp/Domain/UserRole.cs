using Newtonsoft.Json;
using System;
using System.Collections.Generic;


namespace LearningApp.Domain;

public partial class UserRole
{
    public int UserId { get; set; }

    public int RoleId { get; set; }

    public DateTime DateAdded { get; set; }

    public virtual Role Role { get; set; } = null!;
    [JsonIgnore]
    public virtual Users User { get; set; } = null!;
}
