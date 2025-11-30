namespace LearningApp.Application.DTOs
{
    /// <summary>
    /// DTO for AI Recommendation System
    /// Contains student information needed to generate course recommendations
    /// </summary>
    public class StudentAIRecommendationDto
    {
        /// <summary>
        /// Student's current skills (list of skill names)
        /// </summary>
        public List<string> Skills { get; set; } = new();

        /// <summary>
        /// Student's course completion rate (0.0 to 1.0)
        /// Calculated as: Completed Enrollments / Total Enrollments
        /// </summary>
        public decimal CompletionRate { get; set; }

        /// <summary>
        /// Number of courses the student has taken
        /// </summary>
        public int Experience { get; set; }

        /// <summary>
        /// Total enrollment records for the student
        /// </summary>
        public int TotalEnrollments { get; set; }

        /// <summary>
        /// Number of completed courses
        /// </summary>
        public int CompletedCourses { get; set; }

        /// <summary>
        /// Number of active/in-progress courses
        /// </summary>
        public int ActiveCourses { get; set; }

        /// <summary>
        /// Number of dropped courses
        /// </summary>
        public int DroppedCourses { get; set; }

        /// <summary>
        /// Average progress percentage across all enrollments (0-100)
        /// </summary>
        public decimal AverageProgressPercentage { get; set; }

        /// <summary>
        /// Proficiency levels of the student's skills
        /// Key: Skill name, Value: Proficiency level (Beginner, Intermediate, Advanced, Expert)
        /// </summary>
        public Dictionary<string, string> SkillProficiencies { get; set; } = new();

        /// <summary>
        /// Additional metadata
        /// </summary>
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime? LastActivityDate { get; set; }
    }

    /// <summary>
    /// DTO for requesting AI recommendations from the Python API
    /// </summary>
    public class AIRecommendationRequestDto
    {
        /// <summary>
        /// List of skills the student has
        /// </summary>
        public List<string> Skills { get; set; } = new();

        /// <summary>
        /// Student's completion rate (0.0-1.0)
        /// </summary>
        public decimal CompletionRate { get; set; }

        /// <summary>
        /// Number of courses taken (experience)
        /// </summary>
        public int Experience { get; set; }

        /// <summary>
        /// Number of top recommendations to return
        /// </summary>
        public int TopN { get; set; } = 5;
    }

    /// <summary>
    /// Response from the Python AI API
    /// </summary>
    public class AIRecommendationResponseDto
    {
        public RecommendationInputDto Input { get; set; } = new();
        public List<RecommendedCourseDto> Recommendations { get; set; } = new();
    }

    /// <summary>
    /// Input data sent to AI API
    /// </summary>
    public class RecommendationInputDto
    {
        public List<string> Skills { get; set; } = new();
        public decimal CompletionRate { get; set; }
        public int Experience { get; set; }
    }

    /// <summary>
    /// A recommended course from the AI
    /// </summary>
    public class RecommendedCourseDto
    {
        /// <summary>
        /// Course ID
        /// </summary>
        public int CourseId { get; set; }

        /// <summary>
        /// Probability of success (0.0-1.0)
        /// </summary>
        public decimal SuccessProbability { get; set; }

        /// <summary>
        /// Success percentage for display (0-100%)
        /// </summary>
        public string SuccessPercentage => $"{(SuccessProbability * 100):F1}%";

        /// <summary>
        /// Course title (populated from database)
        /// </summary>
        public string? CourseTitle { get; set; }

        /// <summary>
        /// Course description (populated from database)
        /// </summary>
        public string? CourseDescription { get; set; }
    }

    /// <summary>
    /// Combined response with student info and AI recommendations
    /// </summary>
    public class StudentWithRecommendationsDto
    {
        public StudentAIRecommendationDto StudentInfo { get; set; } = new();
        public List<RecommendedCourseDto> RecommendedCourses { get; set; } = new();
    }
}
