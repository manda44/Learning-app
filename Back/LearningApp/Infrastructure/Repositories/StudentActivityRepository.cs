using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class StudentActivityRepository : Repository<StudentActivity>, IStudentActivityRepository
{
    public StudentActivityRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<StudentActivity>> GetStudentActivitiesAsync(int studentId)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Where(e => e.StudentId == studentId)
            .OrderByDescending(e => e.ActivityDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentActivity>> GetActivitiesByTypeAsync(string activityType)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Where(e => e.ActivityType == activityType)
            .OrderByDescending(e => e.ActivityDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentActivity>> GetActivitiesByDateRangeAsync(int studentId, DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Where(e =>
                e.StudentId == studentId &&
                e.ActivityDate >= startDate &&
                e.ActivityDate <= endDate)
            .OrderByDescending(e => e.ActivityDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentActivity>> GetActivitiesByEntityAsync(string entityType, int entityId)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Where(e =>
                e.RelatedEntityType == entityType &&
                e.RelatedEntityId == entityId)
            .OrderByDescending(e => e.ActivityDate)
            .ToListAsync();
    }
}
