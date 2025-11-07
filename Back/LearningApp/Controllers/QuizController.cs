using LearningApp.Application.DTOs;
using LearningApp.Application.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly QuizService _quizService;

        public QuizController(QuizService quizService)
        {
            _quizService = quizService;
        }
        // GET: api/Quiz
        [HttpGet]
        public async Task<ActionResult<List<QuizDto>>> GetQuizList(int page=1,int limit=10,string search="")
        {
            try
            {
                var quizes = await _quizService.GetallQuizzes();
                // Apply search filter if provided
                if (!string.IsNullOrEmpty(search))
                {
                    quizes = quizes.Where(q => q.Title.Contains(search, StringComparison.OrdinalIgnoreCase) || q.Description.Contains(search, StringComparison.OrdinalIgnoreCase)).ToList();
                }

                // Apply pagination
                var totalCount = quizes.Count;
                var pagedQuizes = quizes.Skip((page - 1) * limit).Take(limit).ToList();

                var response = new
                {
                    Quizzes = pagedQuizes,
                    TotalCount = totalCount,
                    Page = page,
                    Limit = limit,
                    TotalPages = (int)Math.Ceiling((double)totalCount / limit),
                    HasNextPage = page * limit < totalCount,
                    HasPreviousPage = page > 1
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching quizzes: {ex.Message}");
            }
        }
        // POST: api/Quiz
        [HttpPost]
        public async Task<ActionResult<QuizDto>> PostQuiz(QuizCreateDto dto)
        {
            var created = await _quizService.AddQuiz(dto);
            return CreatedAtAction(nameof(GetQuiz), new { id = created.QuizId }, created);
        }

        // PUT: api/Quiz/5
        [HttpPut("{id}")]
        public async Task<ActionResult<QuizDto>> PutQuiz(int id, QuizUpdateDto dto)
        {
            try
            {
                if (id != dto.QuizId)
                {
                    return BadRequest("Quiz ID in URL does not match Quiz ID in body");
                }

                var updatedQuiz = await _quizService.UpdateQuiz(dto);
                
                if (updatedQuiz == null)
                {
                    return NotFound($"Quiz with ID {id} not found");
                }

                return Ok(updatedQuiz);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating quiz: {ex.Message}");
            }
        }

        // DELETE: api/Quiz/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteQuiz(int id)
        {
            try
            {
                var deleted = await _quizService.DeleteQuiz(id);
                
                if (!deleted)
                {
                    return NotFound($"Quiz with ID {id} not found");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Error deleting quiz: {ex.Message}");
            }
        }

        // POST: api/Quiz/question
        [HttpPost("question")]
        public async Task<ActionResult<List<QuestionDto>>> PostQuestion(List<QuestionCreateDto> dtos)
        {
            try
            {
                // Get the QuizId from the first question (all questions should have the same QuizId)
                if (dtos == null || !dtos.Any())
                {
                    return BadRequest("No questions provided");
                }

                int quizId = dtos[0].QuizId;

                // Delete all existing questions for this quiz
                await _quizService.DeleteAllQuestions(quizId);

                var createdQuestions = new List<QuestionDto>();
                foreach (var dto in dtos)
                {
                    var created = await _quizService.AddQuestion(dto);
                    createdQuestions.Add(created);
                    foreach(QuestionItemCreateDto questionItemCreate in dto.QuestionItems)
                    {
                        questionItemCreate.QuestionId = created.QuestionId;
                        await _quizService.AddQuestionItem(questionItemCreate);
                    }
                }

                return Ok(createdQuestions);
            }
            catch (Exception ex)
            {
                // Log the exception here if you have logging configured
                return BadRequest($"Error creating questions: {ex.Message}");
            }
        }
        //Get: api/Quiz/questions/1
        [HttpGet("questions/{quizId}")]
        public async Task<ActionResult<List<QuestionDto>>> GetQuestions(int quizId)
        {
            try
            {
                var question = await _quizService.GetQuestion(quizId);
                return Ok(question);
            }
            catch (Exception ex) {
                return BadRequest($"Error creating questions: {ex.Message}");
            }
        }


        // POST: api/Quiz/questionitem
        [HttpPost("questionitem")]
        public async Task<ActionResult<QuestionItemDto>> PostQuestionItem(QuestionItemCreateDto dto)
        {
            var created = await _quizService.AddQuestionItem(dto);
            return CreatedAtAction(nameof(GetQuestionItem), new { id = created.QuestionItemId }, created);
        }

        // GET: api/Quiz/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QuizDto>> GetQuiz(int id)
        {
            try
            {
                var quiz = await _quizService.GetQuizById(id);
                
                if (quiz == null)
                {
                    return NotFound($"Quiz with ID {id} not found");
                }

                return Ok(quiz);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching quiz: {ex.Message}");
            }
        }

        // GET: api/Quiz/question/5
        [HttpGet("question/{id}")]
        public async Task<ActionResult<QuestionDto>> GetQuestion(int id)
        {
            // This method will need to be implemented in QuizService
            return NotFound("GetQuestion method not implemented yet");
        }

        // GET: api/Quiz/questionitem/5
        [HttpGet("questionitem/{id}")]
        public async Task<ActionResult<QuestionItemDto>> GetQuestionItem(int id)
        {
            // This method will need to be implemented in QuizService
            return NotFound("GetQuestionItem method not implemented yet");
        }

        // GET: api/quizzes/{id} (alternative route for frontend compatibility)
        [HttpGet]
        [Route("/api/quizzes/{id}")]
        public async Task<ActionResult<QuizDto>> GetQuizAlternate(int id)
        {
            try
            {
                var quiz = await _quizService.GetQuizById(id);

                if (quiz == null)
                {
                    return NotFound($"Quiz with ID {id} not found");
                }

                return Ok(quiz);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching quiz: {ex.Message}");
            }
        }

        // GET: api/quizzes/{id}/questions (alternative route for frontend compatibility)
        [HttpGet]
        [Route("/api/quizzes/{id}/questions")]
        public async Task<ActionResult<List<QuestionDto>>> GetQuizzesQuestions(int id)
        {
            try
            {
                var questions = await _quizService.GetQuestion(id);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error fetching questions: {ex.Message}");
            }
        }
    }
}
