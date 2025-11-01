using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class StudentTicketProgressRepository : Repository<StudentTicketProgress>, IStudentTicketProgressRepository
{
    public StudentTicketProgressRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<StudentTicketProgress?> GetByStudentAndTicketAsync(int studentId, int ticketId)
    {
        return await _dbSet
            .Include(e => e.Ticket)
            .Include(e => e.Student)
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.TicketId == ticketId);
    }

    public async Task<IEnumerable<StudentTicketProgress>> GetStudentTicketProgressAsync(int studentId)
    {
        return await _dbSet
            .Include(e => e.Ticket)
            .Where(e => e.StudentId == studentId)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentTicketProgress>> GetTicketProgressByStudentsAsync(int ticketId)
    {
        return await _dbSet
            .Include(e => e.Student)
            .Where(e => e.TicketId == ticketId)
            .ToListAsync();
    }

    public async Task<IEnumerable<StudentTicketProgress>> GetProgressByStatusAsync(string status)
    {
        return await _dbSet
            .Include(e => e.Ticket)
            .Include(e => e.Student)
            .Where(e => e.Status == status)
            .ToListAsync();
    }
}
