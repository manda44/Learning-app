using LearningApp.Application.DTOs;
using LearningApp.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentQuizAttemptController : ControllerBase
    {
        private readonly StudentQuizAttemptService _studentQuizAttemptService;

        public StudentQuizAttemptController(StudentQuizAttemptService studentQuizAttemptService)
        {
            _studentQuizAttemptService = studentQuizAttemptService;
        }

        // POST: api/StudentQuizAttempt/start
        [HttpPost("start")]
        public async Task<ActionResult<StudentQuizAttemptDto>> StartQuizAttempt(CreateStudentQuizAttemptDto dto)
        {
            try
            {
                var attempt = await _studentQuizAttemptService.StartQuizAttempt(dto);
                return Ok(attempt);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error starting quiz attempt: {ex.Message}");
            }
        }

        // POST: api/StudentQuizAttempt/submit (creates attempt and submits in one call)
        [HttpPost("submit")]
        public async Task<ActionResult<StudentQuizAttemptDto>> SubmitQuiz(
            [FromBody] SubmitQuizDto dto)
        {
            try
            {
                var result = await _studentQuizAttemptService.SubmitQuiz(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error submitting quiz: {ex.Message}");
            }
        }

        // POST: api/StudentQuizAttempt/{attemptId}/submit
        [HttpPost("{attemptId}/submit")]
        public async Task<ActionResult<StudentQuizAttemptDto>> SubmitQuizAttempt(
            int attemptId,
            [FromBody] SubmitQuizAttemptDto dto)
        {
            try
            {
                var result = await _studentQuizAttemptService.SubmitQuizAttempt(attemptId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error submitting quiz attempt: {ex.Message}");
            }
        }

        // GET: api/StudentQuizAttempt/{attemptId}
        [HttpGet("{attemptId}")]
        public async Task<ActionResult<StudentQuizAttemptDto>> GetQuizAttempt(int attemptId)
        {
            try
            {
                var attempt = await _studentQuizAttemptService.GetQuizAttemptById(attemptId);
                if (attempt == null)
                {
                    return NotFound($"Quiz attempt with ID {attemptId} not found");
                }
                return Ok(attempt);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching quiz attempt: {ex.Message}");
            }
        }

        // GET: api/StudentQuizAttempt/student/{studentId}/quiz/{quizId}
        [HttpGet("student/{studentId}/quiz/{quizId}")]
        public async Task<ActionResult<List<StudentQuizAttemptDto>>> GetStudentQuizAttempts(
            int studentId,
            int quizId)
        {
            try
            {
                var attempts = await _studentQuizAttemptService.GetStudentQuizAttempts(studentId, quizId);
                return Ok(attempts);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching quiz attempts: {ex.Message}");
            }
        }
    }
}
