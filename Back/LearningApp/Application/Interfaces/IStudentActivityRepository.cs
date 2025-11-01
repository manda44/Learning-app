using LearningApp.Domain;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces;

public interface IStudentActivityRepository : IRepository<StudentActivity>
{
    Task<IEnumerable<StudentActivity>> GetStudentActivitiesAsync(int studentId);

    Task<IEnumerable<StudentActivity>> GetActivitiesByTypeAsync(string activityType);

    Task<IEnumerable<StudentActivity>> GetActivitiesByDateRangeAsync(int studentId, DateTime startDate, DateTime endDate);

    Task<IEnumerable<StudentActivity>> GetActivitiesByEntityAsync(string entityType, int entityId);
}
