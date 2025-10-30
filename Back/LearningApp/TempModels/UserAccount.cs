using System;
using System.Collections.Generic;

namespace LearningApp.TempModels;

public partial class UserAccount
{
    public int Id { get; set; }

    public string UserName { get; set; } = null!;

    public string Email { get; set; } = null!;
}
