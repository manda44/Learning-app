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
        private readonly QuizService _quizService;

        public ChaptersController(ChapterService chapterService, QuizService quizService)
        {
            _chapterService = chapterService;
            _quizService = quizService;
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

        // GET: api/Chapters/debug/quizzes
        // Debug endpoint to test quiz retrieval
        [HttpGet("debug/quizzes")]
        public async Task<ActionResult> DebugQuizzes()
        {
            try
            {
                var allQuizzes = await _quizService.GetallQuizzes();
                return Ok(new {
                    totalQuizzes = allQuizzes.Count,
                    quizzes = allQuizzes.Select(q => new {
                        q.QuizId,
                        q.ChapterId,
                        q.Title,
                        q.CourseId
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // GET: api/Chapters/courseChapters/5
        [HttpGet("courseChapters/{chapterId}")]
        public async Task<ActionResult<IEnumerable<CourseDtos>>> GetChaptersWithSameCourse(int chapterId)
        {
            var chapters = await _chapterService.GetChaptersWithSameCourse(chapterId);
            return Ok(chapters);
        }

        // GET: api/Chapters/{chapterId}/detail/{studentId}
        // Returns complete chapter details with all content blocks and student progress
        [HttpGet("{chapterId}/detail/{studentId}")]
        public async Task<ActionResult<ChapterDetailDto>> GetChapterDetail(int chapterId, int studentId)
        {
            try
            {
                // Get chapter basic info
                var chapter = await _chapterService.GetChapterByIdAsync(chapterId);
                if (chapter == null)
                {
                    return NotFound(new { message = "Chapter not found" });
                }

                // Get all content for this chapter
                var contents = await _chapterService.GetChapterContentsAsync(chapterId);

                // Build response DTO
                var result = new ChapterDetailDto
                {
                    ChapterId = chapter.ChapterId,
                    Title = chapter.Title,
                    Description = chapter.Description,
                    Order = chapter.Order,
                    Color = chapter.Color,
                    CreatedAt = chapter.CreatedAd,
                    CourseId = chapter.CourseId,
                    CourseTitle = null, // Will be populated if we have course reference
                    ContentBlocks = contents.Select(c => new ContentBlockDto
                    {
                        ContentId = c.ContentId,
                        Type = c.Type,
                        Data = c.Data,
                        Order = c.Order,
                        CreatedAt = c.CreatedAt
                    }).OrderBy(c => c.Order).ToList(),
                    StudentProgress = null // Will be populated from student progress tracking
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error retrieving chapter details", error = ex.Message });
            }
        }

        // GET: api/Chapters/course/{courseId}/with-content
        // Returns all chapters in a course with content count and student progress
        [HttpGet("course/{courseId}/with-content/{studentId}")]
        public async Task<ActionResult<List<object>>> GetChaptersWithContent(int courseId, int studentId)
        {
            try
            {
                // Get all chapters for the course
                var chapters = await _chapterService.GetChaptersByCourseIdAsync(courseId);

                // Get all quizzes for all chapters in this course
                var allQuizzes = await _quizService.GetallQuizzes();

                // Debug logging
                System.Console.WriteLine($"[DEBUG] CourseId={courseId}, Total chapters: {chapters.Count()}, Total quizzes: {allQuizzes.Count}");
                foreach (var q in allQuizzes)
                {
                    System.Console.WriteLine($"[DEBUG] Quiz {q.QuizId}: ChapterId={q.ChapterId}, Title={q.Title}");
                }
                foreach (var c in chapters)
                {
                    System.Console.WriteLine($"[DEBUG] Chapter {c.ChapterId}: CourseId={c.CourseId}, Title={c.Title}");
                }

                var courseQuizzes = allQuizzes.Where(q => chapters.Any(c => c.ChapterId == q.ChapterId)).ToList();
                System.Console.WriteLine($"[DEBUG] Filtered course quizzes: {courseQuizzes.Count}");

                var result = new List<object>();

                foreach (var chapter in chapters.OrderBy(c => c.Order))
                {
                    // Get content count
                    var contents = await _chapterService.GetChapterContentsAsync(chapter.ChapterId);

                    // Find quiz for this chapter
                    var chapterQuiz = courseQuizzes.FirstOrDefault(q => q.ChapterId == chapter.ChapterId);

                    var listItem = new ChapterListItemDto
                    {
                        ChapterId = chapter.ChapterId,
                        Title = chapter.Title,
                        Description = chapter.Description,
                        Order = chapter.Order,
                        Color = chapter.Color,
                        ContentCount = contents.Count(),
                        HasQuiz = chapterQuiz != null,
                        QuizId = chapterQuiz?.QuizId,
                        StudentProgress = null // Would need to fetch from StudentChapterProgress table
                    };

                    result.Add(listItem);

                    // Add quiz after chapter if it exists
                    if (chapterQuiz != null)
                    {
                        var quizItem = new QuizItemDto
                        {
                            QuizId = chapterQuiz.QuizId,
                            Title = chapterQuiz.Title,
                            Description = chapterQuiz.Title, // Using title as description
                            ChapterId = chapter.ChapterId,
                            Order = chapter.Order, // Quiz appears right after chapter
                            SuccessPercentage = 80 // Default success percentage
                        };
                        result.Add(quizItem);
                    }
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error retrieving chapters with content", error = ex.Message });
            }
        }
    }
}
