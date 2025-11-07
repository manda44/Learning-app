using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces;

public interface IStudentQuizAttemptRepository : IRepository<StudentQuizAttempt>
{
    Task<IEnumerable<StudentQuizAttempt>> GetStudentQuizAttemptsAsync(int studentId);

    Task<IEnumerable<StudentQuizAttempt>> GetQuizAttemptsAsync(int quizId);

    Task<StudentQuizAttempt?> GetLatestAttemptAsync(int studentId, int quizId);

    Task<IEnumerable<StudentQuizAttempt>> GetAttemptsByStatusAsync(string status);

    Task<int> GetAttemptCountAsync(int studentId, int quizId);

    Task<List<StudentQuizAttempt>> GetStudentQuizAttempts(int studentId, int quizId);

    Task<StudentQuizAttempt?> GetQuizAttemptWithResponses(int attemptId);

    Task AddQuestionResponseAsync(StudentQuestionResponse response);

    Task UpdateAsync(StudentQuizAttempt attempt);
}
