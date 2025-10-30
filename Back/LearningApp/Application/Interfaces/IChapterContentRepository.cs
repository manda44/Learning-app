using LearningApp.Application.DTOs;
using LearningApp.Domain;

namespace LearningApp.Application.Interfaces
{
    public interface IChapterContentRepository : IRepository<Content>
    {
        Task<ContentDto> GetContentByChapterIdAsync(int chapterId);
    }
}
