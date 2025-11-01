using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces;

public interface IStudentCourseEnrollmentRepository : IRepository<StudentCourseEnrollment>
{
    Task<StudentCourseEnrollment?> GetByStudentAndCourseAsync(int studentId, int courseId);

    Task<IEnumerable<StudentCourseEnrollment>> GetStudentEnrollmentsAsync(int studentId);

    Task<IEnumerable<StudentCourseEnrollment>> GetCourseEnrollmentsAsync(int courseId);

    Task<IEnumerable<StudentCourseEnrollment>> GetEnrollmentsByStatusAsync(string status);
}
