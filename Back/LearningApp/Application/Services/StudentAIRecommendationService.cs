using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using System.Text.Json;

namespace LearningApp.Application.Services
{
    /// <summary>
    /// Service for managing AI-powered course recommendations
    /// Integrates with Python ML API and database to generate personalized suggestions
    /// </summary>
    public class StudentAIRecommendationService : IStudentAIRecommendationService
    {
        private readonly ApplicationDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly ILogger<StudentAIRecommendationService> _logger;
        private const string AI_API_BASE_URL = "http://localhost:5000";

        public StudentAIRecommendationService(
            ApplicationDbContext context,
            HttpClient httpClient,
            ILogger<StudentAIRecommendationService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Get student information needed for AI recommendations
        /// </summary>
        public async Task<StudentAIRecommendationDto> GetStudentRecommendationInfoAsync(int studentId)
        {
            _logger.LogInformation($"Retrieving AI recommendation info for student {studentId}");

            try
            {
                // Verify student exists
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == studentId);
                if (user == null)
                {
                    _logger.LogWarning($"Student {studentId} not found");
                    throw new ArgumentException($"Student with ID {studentId} not found");
                }

                // Get student enrollments with course details
                var enrollments = await _context.StudentCourseEnrollments
                    .Include(e => e.Course)
                    .Where(e => e.StudentId == studentId)
                    .ToListAsync();

                // Calculate completion rate (all enrollments)
                var completedCount = enrollments.Count(e => e.Status == "completed");
                var totalCount = enrollments.Count;
                var completionRate = totalCount > 0 ? (decimal)completedCount / totalCount : 0;

                // Calculate skills: Get skills from courses with progress >= 80%
                var highProgressCourseIds = enrollments
                    .Where(e => e.ProgressPercentage >= 80)
                    .Select(e => e.CourseId)
                    .Distinct()
                    .ToList();

                var skills = new List<string>();
                if (highProgressCourseIds.Count > 0)
                {
                    // Get all skills from courses where student has >= 80% progress
                    // Query CourseSkill table directly since Course doesn't have CourseSkills navigation property
                    var skillIds = await _context.CourseSkill
                        .Where(cs => highProgressCourseIds.Contains(cs.CourseId))
                        .Select(cs => cs.SkillId)
                        .Distinct()
                        .ToListAsync();

                    if (skillIds.Count > 0)
                    {
                        skills = await _context.Skills
                            .Where(s => skillIds.Contains(s.SkillId))
                            .Select(s => s.SkillName)
                            .Distinct()
                            .ToListAsync();
                    }
                }

                // Calculate experience: Number of courses with progress >= 80%
                var experience = highProgressCourseIds.Count;

                var skillProficiencies = new Dictionary<string, string>();

                // Calculate average progress
                var avgProgress = enrollments.Count > 0
                    ? enrollments.Average(e => e.ProgressPercentage)
                    : 0;

                // Get last activity date
                var lastActivityDate = enrollments.Count > 0
                    ? enrollments.Max(e => e.EnrollmentDate)
                    : (DateTime?)null;

                var dto = new StudentAIRecommendationDto
                {
                    UserId = studentId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Skills = skills,
                    CompletionRate = completionRate,
                    Experience = enrollments.Count,
                    TotalEnrollments = totalCount,
                    CompletedCourses = completedCount,
                    ActiveCourses = enrollments.Count(e => e.Status == "active"),
                    DroppedCourses = enrollments.Count(e => e.Status == "dropped"),
                    AverageProgressPercentage = (decimal)avgProgress,
                    SkillProficiencies = skillProficiencies,
                    LastActivityDate = lastActivityDate
                };

                _logger.LogInformation($"Successfully retrieved AI recommendation info for student {studentId}");
                return dto;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving student recommendation info: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get personalized course recommendations for a specific student
        /// </summary>
        public async Task<StudentWithRecommendationsDto> GetStudentRecommendationsAsync(int studentId, int topN = 5)
        {
            _logger.LogInformation($"Generating AI recommendations for student {studentId}");

            try
            {
                // Get student info
                var studentInfo = await GetStudentRecommendationInfoAsync(studentId);

                // Get recommendations from AI API
                var recommendations = await CallAIRecommendationAPIAsync(
                    new AIRecommendationRequestDto
                    {
                        Skills = studentInfo.Skills,
                        CompletionRate = studentInfo.CompletionRate,
                        Experience = studentInfo.Experience,
                        TopN = topN
                    });

                var result = new StudentWithRecommendationsDto
                {
                    StudentInfo = studentInfo,
                    RecommendedCourses = recommendations
                };

                _logger.LogInformation($"Generated {recommendations.Count} AI recommendations for student {studentId}");
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating recommendations: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Get course recommendations with custom student data
        /// </summary>
        public async Task<List<RecommendedCourseDto>> GetCustomRecommendationsAsync(AIRecommendationRequestDto request)
        {
            _logger.LogInformation("Generating custom AI recommendations");

            try
            {
                // Validate input
                ValidateRecommendationRequest(request);

                // Call AI API
                var recommendations = await CallAIRecommendationAPIAsync(request);

                _logger.LogInformation($"Generated {recommendations.Count} custom AI recommendations");
                return recommendations;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating custom recommendations: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Check if the AI service is healthy
        /// </summary>
        public async Task<bool> IsAIServiceHealthyAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{AI_API_BASE_URL}/health");
                return response.IsSuccessStatusCode;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogWarning($"AI service health check failed: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Private helper: Call the Python AI API for recommendations
        /// </summary>
        private async Task<List<RecommendedCourseDto>> CallAIRecommendationAPIAsync(AIRecommendationRequestDto request)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync(
                    $"{AI_API_BASE_URL}/recommend-custom",
                    new
                    {
                        skills = request.Skills,
                        completion_rate = (double)request.CompletionRate,
                        experience = request.Experience,
                        top_n = request.TopN
                    });

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"AI API returned status {response.StatusCode}");
                    throw new HttpRequestException("AI recommendation service returned an error");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                using JsonDocument doc = JsonDocument.Parse(responseContent);
                var root = doc.RootElement;
                var recommendationsArray = root.GetProperty("recommendations").EnumerateArray().ToArray();

                // Convert to our DTO and enrich with course information
                var recommendations = new List<RecommendedCourseDto>();
                foreach (var rec in recommendationsArray)
                {
                    int courseId = rec.GetProperty("course_id").GetInt32();
                    decimal probability = (decimal)rec.GetProperty("success_probability").GetDouble();

                    // Get course details from database
                    var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);

                    recommendations.Add(new RecommendedCourseDto
                    {
                        CourseId = courseId,
                        SuccessProbability = probability,
                        CourseTitle = course?.Title,
                        CourseDescription = course?.Description
                    });
                }

                return recommendations;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError($"Failed to connect to Python ML API: {ex.Message}");
                throw new HttpRequestException("AI recommendation service is unavailable", ex);
            }
        }

        /// <summary>
        /// Private helper: Validate recommendation request
        /// </summary>
        private void ValidateRecommendationRequest(AIRecommendationRequestDto request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (request.Skills == null || request.Skills.Count == 0)
                throw new ArgumentException("Skills list cannot be empty");

            if (request.CompletionRate < 0 || request.CompletionRate > 1)
                throw new ArgumentException("CompletionRate must be between 0 and 1");

            if (request.Experience < 0)
                throw new ArgumentException("Experience must be a non-negative integer");

            if (request.TopN <= 0)
                throw new ArgumentException("TopN must be greater than 0");
        }
    }
}
