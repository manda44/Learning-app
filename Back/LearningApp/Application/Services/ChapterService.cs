using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;

namespace LearningApp.Application.Services
{
    public class ChapterService
    {
        private readonly IChapterRepository _chapterRepository;

        public ChapterService(IChapterRepository chapterRepository)
        {
            _chapterRepository = chapterRepository;
        }

        public async Task<IEnumerable<ChapterDto>> GetAllChaptersAsync()
        {
            var chapters = await _chapterRepository.GetAllAsync();
            return chapters.Select(c => new ChapterDto
            {
                ChapterId = c.ChapterId,
                Title = c.Title,
                Order = c.Order_,
                CourseId = c.CourseId,
                Description = c.Description,
                CreatedAd = c.CreatedAd,
                Color = c.Color
            });
        }

        public async Task<ChapterDto?> GetChapterByIdAsync(int id)
        {
            var c = await _chapterRepository.GetByIdAsync(id);
            if (c == null) return null;
            return new ChapterDto
            {
                ChapterId = c.ChapterId,
                Title = c.Title,
                Order = c.Order_,
                CourseId = c.CourseId,
                Description = c.Description,
                CreatedAd = c.CreatedAd,
                Color = c.Color
            };
        }

        public async Task<ChapterDto> CreateChapterAsync(ChapterCreateDto dto)
        {
            var chapter = new Chapter
            {
                Title = dto.Title,
                Order_ = dto.Order,
                CourseId = dto.CourseId,
                Description = dto.Description,
                CreatedAd = DateTime.Now,
                Color = dto.Color
            };
            await _chapterRepository.AddAsync(chapter);
            return new ChapterDto
            {
                ChapterId = chapter.ChapterId,
                Title = chapter.Title,
                Order = chapter.Order_,
                CourseId = chapter.CourseId,
                Description = chapter.Description,
                CreatedAd = chapter.CreatedAd,
                Color = chapter.Color
            };
        }

        public async Task<bool> UpdateChapterAsync(ChapterUpdateDto dto)
        {
            var chapter = await _chapterRepository.GetByIdAsync(dto.ChapterId);
            if (chapter == null) return false;
            chapter.Title = dto.Title;
            chapter.Order_ = dto.Order;
            chapter.CourseId = dto.CourseId;
            chapter.Description = dto.Description;
            chapter.Color = dto.Color;
            await _chapterRepository.UpdateAsync(chapter);
            return true;
        }

        public async Task<bool> DeleteChapterAsync(int id)
        {
            var chapter = await _chapterRepository.GetByIdAsync(id);
            if (chapter == null) return false;
            await _chapterRepository.UpdateAsync(chapter);
            return true;
        }

        public async Task<IEnumerable<ChapterDto>> GetChaptersByCourseIdAsync(int courseId)
        {
            return await _chapterRepository.GetChaptersByCourseIdAsync(courseId);
        }
        public async Task<IEnumerable<ChapterDto>> GetChaptersWithSameCourse(int chapterId)
        {
            return await _chapterRepository.GetChaptersWithSameCourse(chapterId);
        }

        public async Task<bool> UpdateChapterTitleAsync(int chapterId, ChapterTitleUpdateDto dto)
        {
            var chapter = await _chapterRepository.GetByIdAsync(chapterId);
            if (chapter == null) return false;
            
            chapter.Title = dto.Title;
            await _chapterRepository.UpdateAsync(chapter);
            return true;
        }

    }
}
