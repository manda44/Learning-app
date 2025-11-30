using System;

namespace LearningApp.Domain;

/// <summary>
/// StudentSkill entity - Tracks skills acquired by students
/// Records the proficiency level of each student in each skill
/// </summary>
public partial class StudentSkill
{
    /// <summary>
    /// Unique identifier for the student-skill relationship
    /// </summary>
    public int StudentSkillId { get; set; }

    /// <summary>
    /// Foreign key to the student (Users table)
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Foreign key to the Skill
    /// </summary>
    public int SkillId { get; set; }

    /// <summary>
    /// Current proficiency level of the student in this skill
    /// Values: 'Beginner', 'Intermediate', 'Advanced', 'Expert'
    /// </summary>
    public string ProficiencyLevel { get; set; } = null!;

    /// <summary>
    /// Number of years of experience the student has with this skill
    /// </summary>
    public decimal? YearsOfExperience { get; set; }

    /// <summary>
    /// Indicates if this skill has been verified by an instructor or assessment
    /// </summary>
    public bool IsVerified { get; set; }

    /// <summary>
    /// Date when the student acquired this skill
    /// </summary>
    public DateTime AcquiredDate { get; set; }

    /// <summary>
    /// Date when the proficiency level was last updated
    /// </summary>
    public DateTime? LastUpdatedDate { get; set; }

    /// <summary>
    /// Foreign key to the instructor/user who verified this skill (nullable)
    /// </summary>
    public int? VerifiedBy { get; set; }

    /// <summary>
    /// Date when this skill was verified
    /// </summary>
    public DateTime? VerificationDate { get; set; }

    // Navigation properties
    public virtual Users User { get; set; } = null!;
    public virtual Skill Skill { get; set; } = null!;
    public virtual Users? Verifier { get; set; }
}
