using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;

namespace LearningApp.Application.Services
{
    public class ChapterContentService
    {
        private readonly IChapterContentRepository _contentRepository;

        public ChapterContentService(IChapterContentRepository contentRepository)
        {
            _contentRepository = contentRepository;
        }

        public async Task<ContentDto> CreateChapterContentAsync(ContentCreateDto dto)
        {
            var contents = await _contentRepository.GetContentByChapterIdAsync(dto.ChapterId);
            if (contents == null)
            {
                var newContent = new Content
                {
                    Type = "chapter",
                    Data = dto.Data,
                    Order = 1,
                    ChapterId = dto.ChapterId,
                    CreatedAt = DateTime.Now
                };

                await _contentRepository.AddAsync(newContent);

                return new ContentDto
                {
                    ContentId = newContent.ContentId,
                    Type = newContent.Type,
                    Data = newContent.Data,
                    Order = newContent.Order,
                    ChapterId = newContent.ChapterId,
                    CreatedAt = newContent.CreatedAt
                };
            }
            else
            {
                var contentUpdateDto = new ContentUpdateDto()
                {
                    ChapterId = contents.ChapterId,
                    ContentId = contents.ContentId,
                    Data = dto.Data,
                    Order = contents.Order,
                    Type = contents.Type,
                };
                await UpdateContentAsync(contentUpdateDto);
                return contents;
            }
        }

        public async Task<IEnumerable<ContentDto>> GetAllContentsAsync()
        {
            var contents = await _contentRepository.GetAllAsync();
            return contents.Select(c => new ContentDto
            {
                ContentId = c.ContentId,
                Type = c.Type,
                Data = c.Data,
                Order = c.Order,
                ChapterId = c.ChapterId,
                CreatedAt = c.CreatedAt
            });
        }

        public async Task<ContentDto?> GetContentByIdAsync(int id)
        {
            var content = await _contentRepository.GetByIdAsync(id);
            if (content == null) return null;
            
            return new ContentDto
            {
                ContentId = content.ContentId,
                Type = content.Type,
                Data = content.Data,
                Order = content.Order,
                ChapterId = content.ChapterId,
                CreatedAt = content.CreatedAt
            };
        }

        public async Task<bool> UpdateContentAsync(ContentUpdateDto dto)
        {
            var content = await _contentRepository.GetByIdAsync(dto.ContentId);
            if (content == null) return false;
            
            content.Type = dto.Type;
            content.Data = dto.Data;
            content.Order = dto.Order;
            content.ChapterId = dto.ChapterId;
            
            await _contentRepository.UpdateAsync(content);
            return true;
        }

        public async Task<bool> DeleteContentAsync(int id)
        {
            var content = await _contentRepository.GetByIdAsync(id);
            if (content == null) return false;
            
            await _contentRepository.UpdateAsync(content);
            return true;
        }

        public async Task<ContentDto> GetContentByChapterIdAsync(int chapterId)
        {
            return await _contentRepository.GetContentByChapterIdAsync(chapterId);
        }
    }
}
