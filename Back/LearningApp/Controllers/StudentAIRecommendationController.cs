using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LearningApp.Controllers
{
    /// <summary>
    /// Controller for AI-powered course recommendations
    /// Provides endpoints to get personalized course suggestions based on student profile
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class StudentAIRecommendationController : ControllerBase
    {
        private readonly IStudentAIRecommendationService _recommendationService;
        private readonly ILogger<StudentAIRecommendationController> _logger;

        public StudentAIRecommendationController(
            IStudentAIRecommendationService recommendationService,
            ILogger<StudentAIRecommendationController> logger)
        {
            _recommendationService = recommendationService ?? throw new ArgumentNullException(nameof(recommendationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get student information for AI recommendation system
        /// Returns: skills, completion_rate, experience, and other metrics
        /// </summary>
        /// <param name="studentId">Student ID</param>
        /// <returns>Student AI Recommendation DTO with calculated metrics</returns>
        [HttpGet("student/{studentId}")]
        [ProducesResponseType(typeof(StudentAIRecommendationDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<StudentAIRecommendationDto>> GetStudentRecommendationInfo(int studentId)
        {
            try
            {
                var studentInfo = await _recommendationService.GetStudentRecommendationInfoAsync(studentId);
                return Ok(studentInfo);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Not found: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving student recommendation info: {ex.Message}");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// Get AI course recommendations for a specific student
        /// Combines student profile with ML model to generate personalized suggestions
        /// </summary>
        /// <param name="studentId">Student ID</param>
        /// <param name="topN">Number of recommendations (default: 5)</param>
        /// <returns>Student info with list of recommended courses and success probabilities</returns>
        [HttpGet("recommendations/{studentId}")]
        [ProducesResponseType(typeof(StudentWithRecommendationsDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(503)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<StudentWithRecommendationsDto>> GetStudentRecommendations(
            int studentId,
            [FromQuery] int topN = 5)
        {
            try
            {
                var recommendations = await _recommendationService.GetStudentRecommendationsAsync(studentId, topN);
                return Ok(recommendations);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Not found: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning($"AI service unavailable: {ex.Message}");
                return StatusCode(503, new { error = "AI recommendation service is unavailable", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving recommendations: {ex.Message}");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// Get AI recommendations with custom student data
        /// Useful for prospect students or custom analysis without requiring a database record
        /// </summary>
        /// <param name="request">Custom student data with skills, completion rate, and experience</param>
        /// <returns>List of recommended courses with success probabilities and course details</returns>
        [HttpPost("recommendations/custom")]
        [ProducesResponseType(typeof(List<RecommendedCourseDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(503)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<List<RecommendedCourseDto>>> GetCustomRecommendations(
            [FromBody] AIRecommendationRequestDto request)
        {
            try
            {
                var recommendations = await _recommendationService.GetCustomRecommendationsAsync(request);
                return Ok(recommendations);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Invalid input: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning($"AI service unavailable: {ex.Message}");
                return StatusCode(503, new { error = "AI recommendation service is unavailable", details = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating custom recommendations: {ex.Message}");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }

        /// <summary>
        /// Check if the AI recommendation service is available and healthy
        /// </summary>
        /// <returns>Health status of the AI service</returns>
        [HttpGet("health")]
        [ProducesResponseType(200)]
        [ProducesResponseType(503)]
        public async Task<ActionResult<object>> CheckAIServiceHealth()
        {
            try
            {
                var isHealthy = await _recommendationService.IsAIServiceHealthyAsync();

                if (isHealthy)
                {
                    return Ok(new { status = "healthy", message = "AI recommendation service is operational" });
                }

                return StatusCode(503, new { status = "unhealthy", message = "AI recommendation service is not responding" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error checking AI service health: {ex.Message}");
                return StatusCode(503, new { status = "unhealthy", message = "Cannot connect to AI service" });
            }
        }
    }
}
