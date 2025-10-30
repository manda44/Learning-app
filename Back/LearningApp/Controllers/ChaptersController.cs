using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LearningApp.Application;
using LearningApp.Application.DTOs;
using LearningApp.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChaptersController : ControllerBase
    {
        private readonly ChapterService _chapterService;

        public ChaptersController(ChapterService chapterService)
        {
            _chapterService = chapterService;
        }

        // GET: api/Chapters
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChapterDto>>> GetChapters()
        {
            var chapters = await _chapterService.GetAllChaptersAsync();
            return Ok(chapters);
        }

        // GET: api/Chapters/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ChapterDto>> GetChapter(int id)
        {
            var chapter = await _chapterService.GetChapterByIdAsync(id);
            if (chapter == null) return NotFound();
            return Ok(chapter);
        }

        // POST: api/Chapters
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<ChapterDto>> PostChapter(ChapterCreateDto dto)
        {
            var created = await _chapterService.CreateChapterAsync(dto);
            return CreatedAtAction(nameof(GetChapter), new { id = created.ChapterId }, created);
        }

        // PUT: api/Chapters/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutChapter(int id, ChapterUpdateDto dto)
        {
            if (id != dto.ChapterId) return BadRequest();
            var updated = await _chapterService.UpdateChapterAsync(dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        // PATCH: api/Chapters/5/title
        [HttpPatch("{id}/title")]
        public async Task<IActionResult> UpdateChapterTitle(int id, ChapterTitleUpdateDto dto)
        {
            var updated = await _chapterService.UpdateChapterTitleAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        // DELETE: api/Chapters/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChapter(int id)
        {
            var deleted = await _chapterService.DeleteChapterAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        // GET: api/Chapters/course/5
        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<ChapterDto>>> GetChaptersByCourseId(int courseId)
        {
            var chapters = await _chapterService.GetChaptersByCourseIdAsync(courseId);
            return Ok(chapters);
        }

        // GET: api/Chapters/courseChapters/5
        [HttpGet("courseChapters/{chapterId}")]
        public async Task<ActionResult<IEnumerable<CourseDtos>>> GetChaptersWithSameCourse(int chapterId)
        {
            var chapters = await _chapterService.GetChaptersWithSameCourse(chapterId);
            return Ok(chapters);
        }
    }
}
