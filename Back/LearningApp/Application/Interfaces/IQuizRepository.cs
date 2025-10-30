using LearningApp.Application.DTOs;
using LearningApp.Domain;

namespace LearningApp.Application.Interfaces;

public interface IQuizRepository : IRepository<Quiz>
{
   Task<List<QuestionDto>> GetQuestions(int quizId);
    Task<List<QuizDto>> GetAll();
    Task<QuizDto?> UpdateQuiz(QuizUpdateDto quizUpdateDto);
    Task<QuizDto?> GetQuizById(int quizId);
    Task<bool> DeleteQuiz(int quizId);
}
