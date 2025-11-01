using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces;

public interface IStudentProjectEnrollmentRepository : IRepository<StudentProjectEnrollment>
{
    Task<StudentProjectEnrollment?> GetByStudentAndProjectAsync(int studentId, int projectId);

    Task<IEnumerable<StudentProjectEnrollment>> GetStudentProjectEnrollmentsAsync(int studentId);

    Task<IEnumerable<StudentProjectEnrollment>> GetProjectEnrollmentsAsync(int projectId);

    Task<IEnumerable<StudentProjectEnrollment>> GetEnrollmentsByStatusAsync(string status);
}
