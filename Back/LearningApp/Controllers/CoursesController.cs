using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using LearningApp.Application;
using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public CoursesController(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        // GET: api/Courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
        {
            return await _context.Courses.ToListAsync();
        }

        // GET: api/Courses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> GetCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
            {
                return NotFound();
            }

            return course;
        }

        // PUT: api/Courses/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCourse(int id, CourseDtos courseDto)
        {
            if (id != courseDto.CourseId)
            {
                return BadRequest();
            }

            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            // Update allowed properties
            course.Title = courseDto.Title;
            course.Description = courseDto.Description;
            course.UpdatedAt = DateTime.Now;
            course.UserId = 4;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }


        // POST: api/Courses
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Course>> PostCourse(CourseDtos course)
        {
            Course toAdd = new Course()
            {
                Title = course.Title,
                Description = course.Description,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                UserId = 1
            };
            try
            {
                _context.Courses.Add(toAdd);
                await _context.SaveChangesAsync();
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
            }
            //_context.Courses.Add(toAdd);
            

            return CreatedAtAction("GetCourse", new { id = course.CourseId }, course);
        }

        // DELETE: api/Courses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Courses/with-enrollment/{studentId}
        // Returns all courses with enrollment status for the specified student
        [HttpGet("with-enrollment/{studentId}")]
        public async Task<ActionResult<IEnumerable<CourseWithEnrollmentDto>>> GetCoursesWithEnrollment(int studentId)
        {
            try
            {
                // Get all courses
                var courses = await _context.Courses.ToListAsync();

                // Get all enrollments for the student
                var enrollments = await _context.StudentCourseEnrollments
                    .Where(e => e.StudentId == studentId)
                    .ToListAsync();

                // Build the result by combining courses with their enrollment data
                var result = courses.Select(course =>
                {
                    var enrollment = enrollments.FirstOrDefault(e => e.CourseId == course.CourseId);

                    return new CourseWithEnrollmentDto
                    {
                        // Course fields
                        CourseId = course.CourseId,
                        Title = course.Title,
                        Description = course.Description,
                        CreatedAt = course.CreatedAt,
                        UpdatedAt = course.UpdatedAt,
                        UserId = course.UserId,

                        // Enrollment fields (null if not enrolled)
                        EnrollmentId = enrollment?.EnrollmentId,
                        EnrollmentDate = enrollment?.EnrollmentDate,
                        Status = enrollment?.Status,
                        ProgressPercentage = enrollment?.ProgressPercentage,
                        CompletionDate = enrollment?.CompletionDate,

                        // Flag indicating enrollment status
                        IsEnrolled = enrollment != null
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error retrieving courses with enrollment", error = ex.Message });
            }
        }

        // GET: api/Courses/search
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Course>>> Search([FromQuery] string q)
        {
            IQueryable<Course> query = _context.Courses;

            if (!string.IsNullOrEmpty(q))
            {
                var lowerCaseQuery = q.ToLower();
                query = query.Where(course =>
                    course.Title.ToLower().Contains(lowerCaseQuery) ||
                    course.Description.ToLower().Contains(lowerCaseQuery) ||
                    course.CreatedAt.ToString().Contains(q) ||
                    (course.UpdatedAt!=null && course.UpdatedAt.Value.ToString().Contains(q))
                );
            }

            return await query.ToListAsync();
        }

        private bool CourseExists(int id)
        {
            return _context.Courses.Any(e => e.CourseId == id);
        }
    }
}
