using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentProjectEnrollmentsController : ControllerBase
    {
        private readonly IStudentProjectEnrollmentRepository _enrollmentRepo;
        private readonly ApplicationDbContext _context;

        public StudentProjectEnrollmentsController(
            IStudentProjectEnrollmentRepository enrollmentRepo,
            ApplicationDbContext context)
        {
            _enrollmentRepo = enrollmentRepo;
            _context = context;
        }

        // GET: api/StudentProjectEnrollments/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentProjectEnrollmentDto>>> GetStudentEnrollments(int studentId)
        {
            var enrollments = await _enrollmentRepo.GetStudentProjectEnrollmentsAsync(studentId);

            var result = new List<StudentProjectEnrollmentDto>();
            foreach (var e in enrollments)
            {
                result.Add(await MapToDtoAsync(e));
            }

            return Ok(result);
        }

        // POST: api/StudentProjectEnrollments/enroll
        [HttpPost("enroll")]
        public async Task<ActionResult<StudentProjectEnrollmentDto>> EnrollInProject(CreateStudentProjectEnrollmentDto dto)
        {
            // Check if already enrolled - use repository to get full object with includes
            var existing = await _enrollmentRepo.GetByStudentAndProjectAsync(dto.StudentId, dto.MiniProjectId);

            if (existing != null)
            {
                // Return existing enrollment instead of error
                return Ok(await MapToDtoAsync(existing));
            }

            try
            {
                var tickets = await _context.Tickets
                    .Where(t => t.MiniProjectId == dto.MiniProjectId)
                    .ToListAsync();

                var enrollment = new StudentProjectEnrollment
                {
                    StudentId = dto.StudentId,
                    MiniProjectId = dto.MiniProjectId,
                    EnrollmentDate = DateTime.Now,
                    Status = "active",
                    ProgressPercentage = 0
                };

                _context.StudentProjectEnrollments.Add(enrollment);
                await _context.SaveChangesAsync();

                foreach (var ticket in tickets)
                {
                    var ticketProgress = new StudentTicketProgress
                    {
                        StudentId = dto.StudentId,
                        TicketId = ticket.TicketId,
                        Status = "pending",
                        ProgressPercentage = 0
                    };
                    _context.StudentTicketProgresses.Add(ticketProgress);
                }

                await _context.SaveChangesAsync();

                var created = await _enrollmentRepo.GetByStudentAndProjectAsync(dto.StudentId, dto.MiniProjectId);

                return CreatedAtAction("GetStudentProjectEnrollment", new { studentId = dto.StudentId, projectId = dto.MiniProjectId }, await MapToDtoAsync(created));
            }
            catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("UNIQUE KEY constraint") == true)
            {
                // Race condition - enrollment was created between check and insert
                var created = await _enrollmentRepo.GetByStudentAndProjectAsync(dto.StudentId, dto.MiniProjectId);
                return Ok(await MapToDtoAsync(created));
            }
        }

        // PUT: api/StudentProjectEnrollments/{enrollmentId}/git-repository
        [HttpPut("{enrollmentId}/git-repository")]
        public async Task<IActionResult> UpdateGitRepository(int enrollmentId, [FromBody] UpdateGitRepositoryDto dto)
        {
            var enrollment = await _context.StudentProjectEnrollments.FindAsync(enrollmentId);
            if (enrollment == null)
            {
                return NotFound();
            }

            enrollment.GitRepositoryUrl = dto.GitRepositoryUrl;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/StudentProjectEnrollments/ticket-progress/{id}
        [HttpPut("ticket-progress/{id}")]
        public async Task<IActionResult> UpdateTicketProgress(int id, UpdateStudentTicketProgressDto dto)
        {
            var progress = await _context.StudentTicketProgresses.FindAsync(id);
            if (progress == null)
            {
                return NotFound();
            }

            if (dto.Status != null)
            {
                progress.Status = dto.Status;

                if (dto.Status == "in_progress" && progress.StartedDate == null)
                {
                    progress.StartedDate = DateTime.Now;
                }
                else if ((dto.Status == "completed" || dto.Status == "validated") && progress.CompletedDate == null)
                {
                    progress.CompletedDate = DateTime.Now;
                    progress.ProgressPercentage = 100;
                }
            }

            if (dto.ProgressPercentage != null) progress.ProgressPercentage = dto.ProgressPercentage.Value;
            if (dto.Notes != null) progress.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/StudentProjectEnrollments/student/{studentId}/project/{projectId}
        [HttpGet("student/{studentId}/project/{projectId}")]
        public async Task<ActionResult<StudentProjectEnrollmentDto>> GetStudentProjectEnrollment(int studentId, int projectId)
        {
            var enrollment = await _enrollmentRepo.GetByStudentAndProjectAsync(studentId, projectId);

            if (enrollment == null)
            {
                return NotFound();
            }

            return Ok(await MapToDtoAsync(enrollment));
        }

        private async Task<StudentProjectEnrollmentDto> MapToDtoAsync(StudentProjectEnrollment e)
        {
            // Fetch ticket progresses separately
            var ticketProgresses = await _context.StudentTicketProgresses
                .Include(tp => tp.Ticket)
                .Where(tp => tp.StudentId == e.StudentId &&
                             e.MiniProject.Tickets.Select(t => t.TicketId).Contains(tp.TicketId))
                .ToListAsync();

            // Calculate progress percentage based on validated/completed tickets
            int progressPercentage = 0;
            if (ticketProgresses.Any())
            {
                var validatedCount = ticketProgresses.Count(tp => tp.Status == "validated");
                progressPercentage = (int)((validatedCount / (double)ticketProgresses.Count) * 100);
            }

            return new StudentProjectEnrollmentDto
            {
                ProjectEnrollmentId = e.ProjectEnrollmentId,
                StudentId = e.StudentId,
                MiniProjectId = e.MiniProjectId,
                EnrollmentDate = e.EnrollmentDate,
                Status = e.Status,
                ProgressPercentage = progressPercentage,
                GitRepositoryUrl = e.GitRepositoryUrl,
                SubmissionDate = e.SubmissionDate,
                SubmissionNotes = e.SubmissionNotes,
                MiniProject = e.MiniProject != null ? new MiniProjectBasicDto
                {
                    MiniProjectId = e.MiniProject.MiniProjectId,
                    Title = e.MiniProject.Title,
                    Description = e.MiniProject.Description,
                    CourseId = e.MiniProject.CourseId,
                    CreatedAt = e.MiniProject.CreatedAt,
                    UpdatedAt = e.MiniProject.UpdatedAt,
                    Tickets = e.MiniProject.Tickets?.Select(t => new TicketBasicDto
                    {
                        TicketId = t.TicketId,
                        MiniProjectId = t.MiniProjectId,
                        Title = t.Title,
                        Description = t.Description,
                        Status = t.Status,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt
                    }).ToList()
                } : null,
                TicketProgresses = ticketProgresses?.Select(tp => new StudentTicketProgressDto
                {
                    TicketProgressId = tp.TicketProgressId,
                    StudentId = tp.StudentId,
                    TicketId = tp.TicketId,
                    StartedDate = tp.StartedDate,
                    CompletedDate = tp.CompletedDate,
                    Status = tp.Status,
                    ProgressPercentage = tp.ProgressPercentage,
                    Notes = tp.Notes,
                    Ticket = tp.Ticket != null ? new TicketBasicDto
                    {
                        TicketId = tp.Ticket.TicketId,
                        MiniProjectId = tp.Ticket.MiniProjectId,
                        Title = tp.Ticket.Title,
                        Description = tp.Ticket.Description,
                        Status = tp.Ticket.Status,
                        CreatedAt = tp.Ticket.CreatedAt,
                        UpdatedAt = tp.Ticket.UpdatedAt
                    } : null
                }).ToList()
            };
        }
    }
}
