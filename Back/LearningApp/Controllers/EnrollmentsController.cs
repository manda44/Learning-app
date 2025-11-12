using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearningApp.Infrastructure.Data;
using LearningApp.Application.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IStudentCourseEnrollmentRepository _enrollmentRepo;

        public EnrollmentsController(
            ApplicationDbContext context,
            IStudentCourseEnrollmentRepository enrollmentRepo)
        {
            _context = context;
            _enrollmentRepo = enrollmentRepo;
        }

        // GET: api/Enrollments/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetStudentEnrollments(int studentId)
        {
            var enrollments = await _context.StudentCourseEnrollments
                .Include(e => e.Course)
                .Where(e => e.StudentId == studentId)
                .OrderByDescending(e => e.EnrollmentDate)
                .ToListAsync();

            var result = new List<object>();

            foreach (var enrollment in enrollments)
            {
                var overallProgress = await CalculateOverallProgress(enrollment.StudentId, enrollment.CourseId);

                // Auto-complete enrollment when progress reaches 100%
                if (overallProgress == 100 && enrollment.Status == "active")
                {
                    enrollment.Status = "completed";
                    enrollment.CompletionDate = DateTime.UtcNow;
                    await _enrollmentRepo.UpdateAsync(enrollment);
                }

                result.Add(new
                {
                    enrollmentId = enrollment.EnrollmentId,
                    studentId = enrollment.StudentId,
                    courseId = enrollment.CourseId,
                    enrollmentDate = enrollment.EnrollmentDate,
                    status = enrollment.Status,
                    progress = overallProgress,
                    completionDate = enrollment.CompletionDate,
                    course = new
                    {
                        courseId = enrollment.Course.CourseId,
                        title = enrollment.Course.Title,
                        description = enrollment.Course.Description
                    }
                });
            }

            return Ok(result);
        }

        // GET: api/Enrollments/all
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllEnrollments()
        {
            var enrollments = await _context.StudentCourseEnrollments
                .Include(e => e.Student)
                .Include(e => e.Course)
                .OrderByDescending(e => e.EnrollmentDate)
                .ToListAsync();

            var result = new List<object>();

            foreach (var enrollment in enrollments)
            {
                var overallProgress = await CalculateOverallProgress(enrollment.StudentId, enrollment.CourseId);

                // Auto-complete enrollment when progress reaches 100%
                if (overallProgress == 100 && enrollment.Status == "active")
                {
                    enrollment.Status = "completed";
                    enrollment.CompletionDate = DateTime.UtcNow;
                    await _enrollmentRepo.UpdateAsync(enrollment);
                }

                result.Add(new
                {
                    enrollment.EnrollmentId,
                    enrollment.StudentId,
                    enrollment.CourseId,
                    enrollment.EnrollmentDate,
                    enrollment.Status,
                    ProgressPercentage = overallProgress,
                    enrollment.CompletionDate,
                    Student = new
                    {
                        UserId = enrollment.Student.UserId,
                        enrollment.Student.FirstName,
                        enrollment.Student.LastName,
                        enrollment.Student.Email
                    },
                    Course = new
                    {
                        enrollment.Course.CourseId,
                        enrollment.Course.Title,
                        enrollment.Course.Description
                    }
                });
            }

            return Ok(result);
        }

        // GET: api/Enrollments/status/{status}
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<object>>> GetEnrollmentsByStatus(string status)
        {
            var enrollments = await _context.StudentCourseEnrollments
                .Include(e => e.Student)
                .Include(e => e.Course)
                .Where(e => e.Status == status)
                .OrderByDescending(e => e.EnrollmentDate)
                .Select(e => new
                {
                    e.EnrollmentId,
                    e.StudentId,
                    e.CourseId,
                    e.EnrollmentDate,
                    e.Status,
                    ProgressPercentage = e.ProgressPercentage,
                    e.CompletionDate,
                    Student = new
                    {
                        UserId = e.Student.UserId,
                        e.Student.FirstName,
                        e.Student.LastName,
                        e.Student.Email
                    },
                    Course = new
                    {
                        e.Course.CourseId,
                        e.Course.Title,
                        e.Course.Description
                    }
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        // POST: api/Enrollments
        [HttpPost]
        public async Task<ActionResult<object>> CreateEnrollment([FromBody] EnrollmentRequest request)
        {
            // Check if student is already enrolled
            var existingEnrollment = await _context.StudentCourseEnrollments
                .FirstOrDefaultAsync(e => e.StudentId == request.StudentId && e.CourseId == request.CourseId);

            if (existingEnrollment != null)
            {
                return BadRequest(new { message = "Student is already enrolled in this course" });
            }

            // Create new enrollment
            var enrollment = new Domain.StudentCourseEnrollment
            {
                StudentId = request.StudentId,
                CourseId = request.CourseId,
                EnrollmentDate = DateTime.UtcNow,
                Status = "active",
                ProgressPercentage = 0
            };

            _context.StudentCourseEnrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAllEnrollments), new { id = enrollment.EnrollmentId }, new
            {
                enrollment.EnrollmentId,
                enrollment.StudentId,
                enrollment.CourseId,
                enrollment.EnrollmentDate,
                enrollment.Status,
                ProgressPercentage = enrollment.ProgressPercentage
            });
        }

        // Helper method to calculate overall progress
        private async Task<int> CalculateOverallProgress(int studentId, int courseId)
        {
            try
            {
                // Get chapters in the course
                var chapters = await _context.Chapters
                    .Where(c => c.CourseId == courseId)
                    .ToListAsync();

                if (chapters.Count == 0)
                    return 0;

                var chapterIds = chapters.Select(c => c.ChapterId).ToList();

                // Get quizzes in the course (through chapters)
                var quizzes = await _context.Quizzes
                    .Where(q => chapterIds.Contains(q.ChapterId))
                    .ToListAsync();

                // Get mini projects in the course
                var miniProjects = await _context.MiniProjects
                    .Where(mp => mp.CourseId == courseId)
                    .ToListAsync();

                // Get student chapter progress
                var chapterProgress = await _context.StudentChapterProgresses
                    .Where(cp => cp.StudentId == studentId && chapterIds.Contains(cp.ChapterId))
                    .ToListAsync();

                // Get student quiz attempts (passed)
                var passedQuizzes = await _context.StudentQuizAttempts
                    .Where(qa => qa.StudentId == studentId &&
                                 quizzes.Select(q => q.QuizId).Contains(qa.QuizId) &&
                                 qa.Status == "passed")
                    .ToListAsync();

                // Get student ticket progress (validated)
                var validatedTickets = await _context.StudentTicketProgresses
                    .Include(tp => tp.Ticket)
                    .ThenInclude(t => t.MiniProject)
                    .Where(tp => tp.StudentId == studentId &&
                                 tp.Status == "validated" &&
                                 miniProjects.Select(mp => mp.MiniProjectId).Contains(tp.Ticket.MiniProjectId))
                    .ToListAsync();

                // Calculate percentages
                int chapterCompletion = chapters.Count > 0
                    ? (int)Math.Round((chapterProgress.Count(cp => cp.Status == "completed") / (double)chapters.Count) * 100)
                    : 0;

                int quizCompletion = quizzes.Count > 0
                    ? (int)Math.Round((passedQuizzes.Count / (double)quizzes.Count) * 100)
                    : 0;

                int ticketCompletion = 0;
                if (miniProjects.Count > 0)
                {
                    // Count total tickets in mini projects
                    var totalTickets = await _context.Tickets
                        .Where(t => miniProjects.Select(mp => mp.MiniProjectId).Contains(t.MiniProjectId))
                        .CountAsync();

                    ticketCompletion = totalTickets > 0
                        ? (int)Math.Round((validatedTickets.Count / (double)totalTickets) * 100)
                        : 0;
                }

                // Calculate overall progress: average of chapter, quiz, and ticket completion
                int overallProgress = (chapterCompletion + quizCompletion + ticketCompletion) / 3;

                return overallProgress;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calculating progress: {ex.Message}");
                return 0;
            }
        }
    }

    public class EnrollmentRequest
    {
        public int StudentId { get; set; }
        public int CourseId { get; set; }
    }
}
