using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class StudentAchievementRepository : Repository<StudentAchievement>, IStudentAchievementRepository
{
    public StudentAchievementRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<StudentAchievement>> GetStudentAchievementsAsync(int studentId)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Where(e => e.StudentId == studentId)
            .OrderByDescending(e => e.UnlockedDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentAchievement>> GetAchievementsByTypeAsync(string achievementType)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Where(e => e.AchievementType == achievementType)
            .OrderByDescending(e => e.UnlockedDate)
            .ToListAsync();
    }

    public async Task<StudentAchievement?> GetAchievementByTypeAndEntityAsync(int studentId, string achievementType, int? entityId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(e =>
                e.StudentId == studentId &&
                e.AchievementType == achievementType &&
                e.RelatedEntityId == entityId);
    }

    public async Task<int> GetStudentPointsAsync(int studentId)
    {
        return await _dbSet
            .Where(e => e.StudentId == studentId)
            .SumAsync(e => e.Points);
    }
}
