using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories
{
    public class ContentRepository : Repository<Content>, IChapterContentRepository
    {
        public ContentRepository(ApplicationDbContext context) : base(context) { }

        public async Task<ContentDto> GetContentByChapterIdAsync(int chapterId)
        {
            var contents = await _context.Contents
                .Where(c => c.ChapterId == chapterId)
                .OrderByDescending(c => c.ContentId)
                .Select(c => new ContentDto
                {
                    ContentId = c.ContentId,
                    Type = c.Type,
                    Data = c.Data,
                    Order = c.Order,
                    ChapterId = c.ChapterId,
                    CreatedAt = c.CreatedAt
                }).FirstOrDefaultAsync();
            
            return contents;
        }
    }
}