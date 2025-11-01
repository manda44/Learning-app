using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces;

public interface IStudentTicketProgressRepository : IRepository<StudentTicketProgress>
{
    Task<StudentTicketProgress?> GetByStudentAndTicketAsync(int studentId, int ticketId);

    Task<IEnumerable<StudentTicketProgress>> GetStudentTicketProgressAsync(int studentId);

    Task<IEnumerable<StudentTicketProgress>> GetTicketProgressByStudentsAsync(int ticketId);

    Task<IEnumerable<StudentTicketProgress>> GetProgressByStatusAsync(string status);
}
