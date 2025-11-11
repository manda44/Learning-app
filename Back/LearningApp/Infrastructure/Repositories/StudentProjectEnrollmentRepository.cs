using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class StudentProjectEnrollmentRepository : Repository<StudentProjectEnrollment>, IStudentProjectEnrollmentRepository
{
    public StudentProjectEnrollmentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<StudentProjectEnrollment?> GetByStudentAndProjectAsync(int studentId, int projectId)
    {
        return await _dbSet
            .Include(e => e.MiniProject)
                .ThenInclude(mp => mp.Tickets)
            .Include(e => e.Student)
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.MiniProjectId == projectId);
    }

    public async Task<IEnumerable<StudentProjectEnrollment>> GetStudentProjectEnrollmentsAsync(int studentId)
    {
        return await _dbSet
            .Include(e => e.MiniProject)
                .ThenInclude(mp => mp.Tickets)
            .Where(e => e.StudentId == studentId)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentProjectEnrollment>> GetProjectEnrollmentsAsync(int projectId)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Where(e => e.MiniProjectId == projectId)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentProjectEnrollment>> GetEnrollmentsByStatusAsync(string status)
    {
        return await _dbSet
            .Include(e => e.MiniProject)
            .Include(e => e.Student)
            .Where(e => e.Status == status)
            .ToListAsync();
    }
}
