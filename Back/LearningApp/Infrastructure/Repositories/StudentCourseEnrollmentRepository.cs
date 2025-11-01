using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class StudentCourseEnrollmentRepository : Repository<StudentCourseEnrollment>, IStudentCourseEnrollmentRepository
{
    public StudentCourseEnrollmentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<StudentCourseEnrollment?> GetByStudentAndCourseAsync(int studentId, int courseId)
    {
        return await _dbSet
            .Include(e => e.Course)
            .Include(e => e.Student)
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);
    }

    public async Task<IEnumerable<StudentCourseEnrollment>> GetStudentEnrollmentsAsync(int studentId)
    {
        return await _dbSet
            .Include(e => e.Course)
            .Where(e => e.StudentId == studentId)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentCourseEnrollment>> GetCourseEnrollmentsAsync(int courseId)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Where(e => e.CourseId == courseId)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentCourseEnrollment>> GetEnrollmentsByStatusAsync(string status)
    {
        return await _dbSet
            .Include(e => e.Course)
            .Include(e => e.Student)
            .Where(e => e.Status == status)
            .ToListAsync();
    }
}
