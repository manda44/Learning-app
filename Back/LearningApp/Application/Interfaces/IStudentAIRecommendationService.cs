using LearningApp.Application.DTOs;

namespace LearningApp.Application.Interfaces
{
    /// <summary>
    /// Service interface for AI-powered course recommendations
    /// Integrates with Python ML API to generate personalized course suggestions
    /// </summary>
    public interface IStudentAIRecommendationService
    {
        /// <summary>
        /// Get student information needed for AI recommendations
        /// Retrieves skills, completion rate, and experience from database
        /// </summary>
        /// <param name="studentId">Student ID</param>
        /// <returns>Student AI Recommendation DTO with calculated metrics</returns>
        /// <exception cref="ArgumentException">Thrown when student not found</exception>
        Task<StudentAIRecommendationDto> GetStudentRecommendationInfoAsync(int studentId);

        /// <summary>
        /// Get personalized course recommendations for a specific student
        /// Calls Python ML API with student's profile and returns enriched results
        /// </summary>
        /// <param name="studentId">Student ID</param>
        /// <param name="topN">Number of recommendations to return (default: 5)</param>
        /// <returns>Student info with list of recommended courses and success probabilities</returns>
        /// <exception cref="ArgumentException">Thrown when student not found</exception>
        /// <exception cref="HttpRequestException">Thrown when AI service is unavailable</exception>
        Task<StudentWithRecommendationsDto> GetStudentRecommendationsAsync(int studentId, int topN = 5);

        /// <summary>
        /// Get course recommendations with custom student data
        /// Doesn't require a student to exist in database - useful for prospects or custom analysis
        /// </summary>
        /// <param name="request">Custom student data (skills, completion rate, experience)</param>
        /// <returns>List of recommended courses with success probabilities and course details</returns>
        /// <exception cref="ArgumentException">Thrown when input validation fails</exception>
        /// <exception cref="HttpRequestException">Thrown when AI service is unavailable</exception>
        Task<List<RecommendedCourseDto>> GetCustomRecommendationsAsync(AIRecommendationRequestDto request);

        /// <summary>
        /// Check if the Python AI service is healthy and available
        /// </summary>
        /// <returns>True if service is available, false otherwise</returns>
        Task<bool> IsAIServiceHealthyAsync();
    }
}
