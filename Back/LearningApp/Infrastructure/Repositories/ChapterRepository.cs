using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories
{
    public class ChapterRepository : Repository<Chapter>, IChapterRepository
    {
        public ChapterRepository(ApplicationDbContext context) : base(context) { }

        public Task<IEnumerable<ChapterDto>> GetChaptersWithSameCourse(int chapterId)
        {
           var chapter = _context.Chapters
                .AsNoTracking()
                .FirstOrDefault(c => c.ChapterId == chapterId);
            if (chapter == null)
            {
                return Task.FromResult<IEnumerable<ChapterDto>>(new List<ChapterDto>());
            }
            var courseId = chapter.CourseId;
            var chapters = _context.Chapters
                .AsNoTracking()
                .Where(c => c.CourseId == courseId)
                .Select(c => new ChapterDto
                {
                    ChapterId = c.ChapterId,
                    Title = c.Title,
                    Description = c.Description,
                    CreatedAd = c.CreatedAd,
                    CourseId = c.CourseId,
                    Color = c.Color
                });
            return Task.FromResult(chapters.AsEnumerable());
        }

        // Add specific methods for Chapter if needed
        async Task<IEnumerable<ChapterDto>> IChapterRepository.GetChaptersByCourseIdAsync(int courseId)
        {
            var chapters=  await _context.Chapters
                .Where(c => c.CourseId == courseId)
                .Select(c => new ChapterDto
                {
                    ChapterId = c.ChapterId,
                    Title = c.Title,
                    Description = c.Description,
                    CreatedAd = c.CreatedAd,
                    CourseId = c.CourseId,
                    Color = c.Color
                }).ToListAsync();
            return chapters;

        }
    }
}
