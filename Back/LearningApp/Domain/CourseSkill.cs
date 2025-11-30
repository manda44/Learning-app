using System;

namespace LearningApp.Domain;

/// <summary>
/// CourseSkill entity - Maps the skills required for each course
/// This is a many-to-many junction table between Course and Skill
/// </summary>
public partial class CourseSkill
{
    /// <summary>
    /// Unique identifier for the course-skill relationship
    /// </summary>
    public int CourseSkillId { get; set; }

    /// <summary>
    /// Foreign key to the Course
    /// </summary>
    public int CourseId { get; set; }

    /// <summary>
    /// Foreign key to the Skill
    /// </summary>
    public int SkillId { get; set; }

    /// <summary>
    /// Indicates if this skill is required (1) or optional (0) for the course
    /// </summary>
    public bool IsRequired { get; set; }

    /// <summary>
    /// The level of proficiency expected in this skill for the course
    /// Values: 'Basic', 'Proficient', 'Expert'
    /// </summary>
    public string? ProficiencyLevel { get; set; }

    /// <summary>
    /// Date when this skill requirement was added to the course
    /// </summary>
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public virtual Course Course { get; set; } = null!;
    public virtual Skill Skill { get; set; } = null!;
}
