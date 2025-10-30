using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class Users
{
    public int UserId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public DateTime? CreationDate { get; set; }

    public string? Password { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<ConnexionHistory> ConnexionHistories { get; set; } = new List<ConnexionHistory>();

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    public virtual ICollection<QuizResponse> QuizResponses { get; set; } = new List<QuizResponse>();
}
