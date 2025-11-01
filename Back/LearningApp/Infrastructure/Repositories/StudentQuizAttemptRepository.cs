using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class StudentQuizAttemptRepository : Repository<StudentQuizAttempt>, IStudentQuizAttemptRepository
{
    public StudentQuizAttemptRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<StudentQuizAttempt>> GetStudentQuizAttemptsAsync(int studentId)
    {
        return await _dbSet
            .Include(e => e.Quiz)
            .Include(e => e.Student)
            .Include(e => e.StudentQuestionResponses)
            .Where(e => e.StudentId == studentId)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentQuizAttempt>> GetQuizAttemptsAsync(int quizId)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Include(e => e.StudentQuestionResponses)
            .Where(e => e.QuizId == quizId)
            .ToListAsync();
    }

    public async Task<StudentQuizAttempt?> GetLatestAttemptAsync(int studentId, int quizId)
    {
        return await _dbSet
            .Include(e => e.Quiz)
            .Include(e => e.StudentQuestionResponses)
            .Where(e => e.StudentId == studentId && e.QuizId == quizId)
            .OrderByDescending(e => e.AttemptDate)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<StudentQuizAttempt>> GetAttemptsByStatusAsync(string status)
    {
        return await _dbSet
            .Include(e => e.Quiz)
            .Include(e => e.Student)
            .Where(e => e.Status == status)
            .ToListAsync();
    }

    public async Task<int> GetAttemptCountAsync(int studentId, int quizId)
    {
        return await _dbSet
            .CountAsync(e => e.StudentId == studentId && e.QuizId == quizId);
    }
}
