using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;

namespace LearningApp.Application.Services
{
    public class QuizService
    {
        private readonly IQuestionRepository _questionRepository;
        private readonly IQuizRepository _quizRepository;
        private readonly IQuestionItemRepository _questionItemRepository;

        public QuizService(IQuestionItemRepository questionItemRepository,IQuizRepository quizRepository,IQuestionRepository questionRepository)
        {
            _questionItemRepository = questionItemRepository;
            _quizRepository = quizRepository;
            _questionRepository = questionRepository;
        }

        public async Task<QuizDto> AddQuiz(QuizCreateDto quizCreateDto)
        {
            var newQuiz = new Quiz()
            {
                ChapterId = quizCreateDto.ChapterId,
                Title = quizCreateDto.Title,
                Description = quizCreateDto.Description,
                SuccessPercentage = quizCreateDto.SuccessPercentage,
            };
            await _quizRepository.AddAsync(newQuiz);

            return new QuizDto()
            {
                ChapterId = quizCreateDto.ChapterId,
                Title = quizCreateDto.Title,
                QuizId = newQuiz.QuizId,
            };
        }

        public async Task<QuizDto?> UpdateQuiz(QuizUpdateDto quizUpdateDto)
        {
            return await _quizRepository.UpdateQuiz(quizUpdateDto);
        }

        public async Task<QuizDto?> GetQuizById(int quizId)
        {
            return await _quizRepository.GetQuizById(quizId);
        }

        public async Task<bool> DeleteQuiz(int quizId)
        {
            return await _quizRepository.DeleteQuiz(quizId);
        }

        public async Task DeleteAllQuestions(int QuizId)
        {
            IEnumerable<Question> questions = (await _questionRepository.GetAllAsync()).Where(q => q.QuizId == QuizId);
            foreach (Question question in questions) {
                IEnumerable<QuestionItem> questionItems = (await _questionItemRepository.GetAllAsync()).Where(qi => qi.QuestionId == question.QuestionId);
                foreach (QuestionItem questionItem in questionItems) {
                    _questionItemRepository.Delete(questionItem);
                }
                _questionRepository.Delete(question);
            }
        }
        public async Task<QuestionDto> AddQuestion(QuestionCreateDto questionCreateDto)
        {
            var newQuestion = new Question()
            {
                QuizId = questionCreateDto.QuizId,
                Type = questionCreateDto.Type,
                Content = questionCreateDto.Content,
                Rank = questionCreateDto.Rank,
                Explanation = questionCreateDto.Explanation,
            };
            await _questionRepository.AddAsync(newQuestion);

            return new QuestionDto()
            {
                QuestionId = newQuestion.QuestionId,
                QuizId = questionCreateDto.QuizId,
                Type = questionCreateDto.Type,
                Content = questionCreateDto.Content,
                Rank = questionCreateDto.Rank,
            };
        }

        public async Task<QuestionItemDto> AddQuestionItem(QuestionItemCreateDto questionItemCreateDto)
        {
            var newQuestionItem = new QuestionItem()
            {
                QuestionId = questionItemCreateDto.QuestionId,
                Content = questionItemCreateDto.Content,
                IsRight = questionItemCreateDto.IsRight,
                RightResponse = questionItemCreateDto.RightResponse,
            };
            await _questionItemRepository.AddAsync(newQuestionItem);

            return new QuestionItemDto()
            {
                QuestionItemId = newQuestionItem.QuestionItemId,
                QuestionId = questionItemCreateDto.QuestionId,
                Content = questionItemCreateDto.Content,
                IsRight = questionItemCreateDto.IsRight,
                RightResponse = questionItemCreateDto.RightResponse,
            };
        }

        public async Task<List<QuestionDto>> GetQuestion(int quizId)
        {
            return await _quizRepository.GetQuestions(quizId);
        }

        public async Task<List<QuizDto>> GetallQuizzes()
        {
            return await _quizRepository.GetAll();
        }
    }
}
