using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces;

public interface IStudentAchievementRepository : IRepository<StudentAchievement>
{
    Task<IEnumerable<StudentAchievement>> GetStudentAchievementsAsync(int studentId);

    Task<IEnumerable<StudentAchievement>> GetAchievementsByTypeAsync(string achievementType);

    Task<StudentAchievement?> GetAchievementByTypeAndEntityAsync(int studentId, string achievementType, int? entityId);

    Task<int> GetStudentPointsAsync(int studentId);
}
