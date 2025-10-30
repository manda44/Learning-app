using LearningApp.Application.DTOs;
using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces
{
    public interface IChapterRepository : IRepository<Chapter>
    {
        // Add specific methods for Chapter if needed
        Task<IEnumerable<ChapterDto>> GetChaptersByCourseIdAsync(int courseId);
        Task<IEnumerable<ChapterDto>> GetChaptersWithSameCourse(int chapterId);

    }
}
