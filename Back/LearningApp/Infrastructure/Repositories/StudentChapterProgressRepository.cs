using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class StudentChapterProgressRepository : Repository<StudentChapterProgress>, IStudentChapterProgressRepository
{
    public StudentChapterProgressRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<StudentChapterProgress?> GetByStudentAndChapterAsync(int studentId, int chapterId)
    {
        return await _dbSet
            .Include(e => e.Chapter)
            .Include(e => e.Student)
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.ChapterId == chapterId);
    }

    public async Task<IEnumerable<StudentChapterProgress>> GetStudentChapterProgressAsync(int studentId)
    {
        return await _dbSet
            .Include(e => e.Chapter)
            .Where(e => e.StudentId == studentId)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentChapterProgress>> GetChapterProgressByStudentsAsync(int chapterId)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Where(e => e.ChapterId == chapterId)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentChapterProgress>> GetProgressByStatusAsync(string status)
    {
        return await _dbSet
            .Include(e => e.Chapter)
            .Include(e => e.Student)
            .Where(e => e.Status == status)
            .ToListAsync();
    }
}
