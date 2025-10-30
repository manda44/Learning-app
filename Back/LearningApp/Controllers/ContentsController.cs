using LearningApp.Application.DTOs;
using LearningApp.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContentsController : ControllerBase
    {
        private readonly ChapterContentService _contentService;

        public ContentsController(ChapterContentService contentService)
        {
            _contentService = contentService;
        }

        // GET: api/Contents
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContentDto>>> GetContents()
        {
            var contents = await _contentService.GetAllContentsAsync();
            return Ok(contents);
        }

        // GET: api/Contents/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ContentDto>> GetContent(int id)
        {
            var content = await _contentService.GetContentByIdAsync(id);
            if (content == null) return NotFound();
            return Ok(content);
        }

        // GET: api/Contents/chapter/5
        [HttpGet("chapter/{chapterId}")]
        public async Task<ActionResult<ContentDto>> GetContentsByChapterId(int chapterId)
        {
            var content = await _contentService.GetContentByChapterIdAsync(chapterId);
            return Ok(content);
        }

        // POST: api/Contents
        [HttpPost]
        public async Task<ActionResult<ContentDto>> PostContent(ContentCreateDto dto)
        {
            var created = await _contentService.CreateChapterContentAsync(dto);
            return CreatedAtAction(nameof(GetContent), new { id = created.ContentId }, created);
        }

        // PUT: api/Contents/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutContent(int id, ContentUpdateDto dto)
        {
            if (id != dto.ContentId) return BadRequest();
            var updated = await _contentService.UpdateContentAsync(dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        // DELETE: api/Contents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContent(int id)
        {
            var deleted = await _contentService.DeleteContentAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}