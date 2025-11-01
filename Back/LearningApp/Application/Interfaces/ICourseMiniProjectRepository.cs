using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces;

public interface ICourseMiniProjectRepository : IRepository<CourseMiniProject>
{
    Task<CourseMiniProject?> GetByCoursAndProjectAsync(int courseId, int projectId);

    Task<IEnumerable<CourseMiniProject>> GetCourseProjectsAsync(int courseId);

    Task<IEnumerable<CourseMiniProject>> GetProjectCoursesAsync(int projectId);

    Task<bool> ExistsAsync(int courseId, int projectId);
}
