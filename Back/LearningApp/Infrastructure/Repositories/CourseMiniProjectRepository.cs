using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class CourseMiniProjectRepository : Repository<CourseMiniProject>, ICourseMiniProjectRepository
{
    public CourseMiniProjectRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<CourseMiniProject?> GetByCoursAndProjectAsync(int courseId, int projectId)
    {
        return await _dbSet
            .Include(e => e.Course)
            .Include(e => e.MiniProject)
            .FirstOrDefaultAsync(e =>
                e.CourseId == courseId &&
                e.MiniProjectId == projectId);
    }

    public async Task<IEnumerable<CourseMiniProject>> GetCourseProjectsAsync(int courseId)
    {
        return await _dbSet
            .Include(e => e.Course)
            .Include(e => e.MiniProject)
            .Where(e => e.CourseId == courseId)
            .ToListAsync();
    }

    public async Task<IEnumerable<CourseMiniProject>> GetProjectCoursesAsync(int projectId)
    {
        return await _dbSet
            .Include(e => e.Course)
            .Include(e => e.MiniProject)
            .Where(e => e.MiniProjectId == projectId)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(int courseId, int projectId)
    {
        return await _dbSet
            .AnyAsync(e =>
                e.CourseId == courseId &&
                e.MiniProjectId == projectId);
    }
}
