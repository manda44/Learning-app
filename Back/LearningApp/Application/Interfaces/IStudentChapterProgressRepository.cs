using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces;

public interface IStudentChapterProgressRepository : IRepository<StudentChapterProgress>
{
    Task<StudentChapterProgress?> GetByStudentAndChapterAsync(int studentId, int chapterId);

    Task<IEnumerable<StudentChapterProgress>> GetStudentChapterProgressAsync(int studentId);

    Task<IEnumerable<StudentChapterProgress>> GetChapterProgressByStudentsAsync(int chapterId);

    Task<IEnumerable<StudentChapterProgress>> GetProgressByStatusAsync(string status);
}
