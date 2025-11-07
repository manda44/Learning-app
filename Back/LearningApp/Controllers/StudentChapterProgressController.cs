using LearningApp.Application.DTOs;
using LearningApp.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentChapterProgressController : ControllerBase
    {
        private readonly StudentChapterProgressService _progressService;

        public StudentChapterProgressController(StudentChapterProgressService progressService)
        {
            _progressService = progressService;
        }

        // POST: api/StudentChapterProgress/complete
        // Mark a chapter as completed
        [HttpPost("complete")]
        public async Task<ActionResult<StudentChapterProgressDto>> MarkChapterAsCompleted(
            [FromBody] CreateStudentChapterProgressDto dto)
        {
            try
            {
                var result = await _progressService.MarkChapterAsCompleted(dto.StudentId, dto.ChapterId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error marking chapter as completed", error = ex.Message });
            }
        }

        // GET: api/StudentChapterProgress/course/{courseId}/student/{studentId}/lock-status
        // Get all chapters with their lock status for a student
        [HttpGet("course/{courseId}/student/{studentId}/lock-status")]
        public async Task<ActionResult<List<ChapterWithLockStatusDto>>> GetChaptersWithLockStatus(
            int courseId, int studentId)
        {
            try
            {
                var result = await _progressService.GetChaptersWithLockStatus(courseId, studentId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error retrieving chapter lock status", error = ex.Message });
            }
        }

        // GET: api/StudentChapterProgress/chapter/{chapterId}/student/{studentId}/accessible
        // Check if a chapter is accessible for a student
        [HttpGet("chapter/{chapterId}/student/{studentId}/accessible")]
        public async Task<ActionResult<bool>> IsChapterAccessible(int chapterId, int studentId)
        {
            try
            {
                var result = await _progressService.IsChapterAccessible(studentId, chapterId);
                return Ok(new { accessible = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error checking chapter accessibility", error = ex.Message });
            }
        }
    }
}
