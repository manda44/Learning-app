using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

/// <summary>
/// Skill entity - Master table for all available skills in the learning platform
/// </summary>
public partial class Skill
{
    /// <summary>
    /// Unique identifier for the skill
    /// </summary>
    public int SkillId { get; set; }

    /// <summary>
    /// Name of the skill (e.g., "Python Programming", "React", "Docker")
    /// </summary>
    public string SkillName { get; set; } = null!;

    /// <summary>
    /// Description of what this skill entails
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Category of the skill (Frontend, Backend, DevOps, Database, Cloud, etc.)
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Proficiency level (Beginner, Intermediate, Advanced)
    /// </summary>
    public string? Level { get; set; }

    /// <summary>
    /// Date when the skill was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Date when the skill was last updated
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public virtual ICollection<CourseSkill> CourseSkills { get; set; } = new List<CourseSkill>();
    public virtual ICollection<StudentSkill> StudentSkills { get; set; } = new List<StudentSkill>();
}
