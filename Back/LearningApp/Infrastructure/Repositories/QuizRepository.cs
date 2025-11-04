using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class QuizRepository : Repository<Quiz>,IQuizRepository
{
    public QuizRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<List<QuizDto>> GetAll()
    {
        try
        {
            var quizList = await _context.Quizzes
                .AsNoTracking()
                .Include(q => q.Chapter)
                .ThenInclude(c => c.Course)
                .Include(q => q.Questions)
                .Select(q => new QuizDto
                {
                    ChapterId = q.ChapterId,
                    QuizId = q.QuizId,
                    SuccessPercentage = q.SuccessPercentage,
                    Title = q.Title,
                    Description = q.Description,
                    CourseId = q.Chapter != null ? q.Chapter.CourseId : 0,
                    CreatedAt = q.CreatedAt,
                    QuestionCount = q.Questions.Count,
                    CourseName = q.Chapter != null && q.Chapter.Course != null ? q.Chapter.Course.Title : "Unknown",
                    ChapterName = q.Chapter != null ? q.Chapter.Title : "Unknown",
                }).ToListAsync();

            System.Console.WriteLine($"[DEBUG GetAll] Retrieved {quizList.Count} quizzes from database");
            foreach (var quiz in quizList)
            {
                System.Console.WriteLine($"[DEBUG GetAll] Quiz: {quiz.QuizId}, Title: {quiz.Title}, ChapterId: {quiz.ChapterId}");
            }

            return quizList;
        }
        catch (Exception ex)
        {
            System.Console.WriteLine($"[ERROR GetAll] Exception: {ex.Message}");
            System.Console.WriteLine($"[ERROR GetAll] StackTrace: {ex.StackTrace}");
            return new List<QuizDto>();
        }
    }

    public async Task<List<QuestionDto>> GetQuestions(int quizId)
    {
        var questions = await _context.Questions
            .Where(q => q.QuizId == quizId)
            .Include(q => q.QuestionItems)
            .Select(q => new QuestionDto
            {
                QuestionId = q.QuestionId,
                QuizId = q.QuizId,
                Content = q.Content,
                Rank = q.Rank,
                Type = q.Type,
                Explanation = q.Explanation,
                QuestionItems = q.QuestionItems.Select(qi => new QuestionItemDto
                {
                    Content = qi.Content,
                    QuestionId = qi.QuestionId,
                    IsRight = qi.IsRight,
                    QuestionItemId = qi.QuestionItemId,
                    RightResponse = qi.RightResponse,
                }).ToList()
            })
            .ToListAsync();
        return questions;
    }

    public async Task<QuizDto?> GetQuizById(int quizId)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Chapter)
            .ThenInclude(c => c.Course)
            .Include(q => q.Questions)
            .Where(q => q.QuizId == quizId)
            .Select(q => new QuizDto
            {
                ChapterId = q.ChapterId,
                QuizId = q.QuizId,
                SuccessPercentage = q.SuccessPercentage,
                Title = q.Title,
                Description = q.Description,
                CourseId = q.Chapter.CourseId,
                CreatedAt = q.CreatedAt,
                QuestionCount = q.Questions.Count,
                CourseName = q.Chapter.Course.Title,
                ChapterName = q.Chapter.Title,
            })
            .FirstOrDefaultAsync();
        
        return quiz;
    }

    public async Task<QuizDto?> UpdateQuiz(QuizUpdateDto quizUpdateDto)
    {
        var existingQuiz = await _context.Quizzes.FindAsync(quizUpdateDto.QuizId);
        
        if (existingQuiz == null)
        {
            return null;
        }

        existingQuiz.Title = quizUpdateDto.Title;
        existingQuiz.Description = quizUpdateDto.Description;
        existingQuiz.SuccessPercentage = quizUpdateDto.SuccessPercentage;
        existingQuiz.ChapterId = quizUpdateDto.ChapterId;

        await _context.SaveChangesAsync();

        return await GetQuizById(existingQuiz.QuizId);
    }

    public async Task<bool> DeleteQuiz(int quizId)
    {
        var quiz = await _context.Quizzes.FindAsync(quizId);
        
        if (quiz == null)
        {
            return false;
        }

        // Delete related quiz responses first
        var quizResponses = await _context.QuizResponses
            .Where(qr => qr.QuizId == quizId)
            .ToListAsync();
        
        foreach (var quizResponse in quizResponses)
        {
            // Delete related question responses
            var questionResponses = await _context.QuestionResponses
                .Where(qr => qr.QuizResponseId == quizResponse.QuizResponseId)
                .ToListAsync();
            
            _context.QuestionResponses.RemoveRange(questionResponses);
        }
        
        _context.QuizResponses.RemoveRange(quizResponses);

        // Delete related questions and their items
        var questions = await _context.Questions
            .Include(q => q.QuestionItems)
            .Where(q => q.QuizId == quizId)
            .ToListAsync();

        foreach (var question in questions)
        {
            _context.QuestionItems.RemoveRange(question.QuestionItems);
        }

        _context.Questions.RemoveRange(questions);

        // Finally delete the quiz
        _context.Quizzes.Remove(quiz);
        
        await _context.SaveChangesAsync();
        return true;
    }
}
