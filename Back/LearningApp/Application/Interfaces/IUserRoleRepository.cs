using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces
{
    public interface IUserRoleRepository : IRepository<UserRole>
    {
        // Specific methods for UserRole if any, otherwise IRepository is sufficient
        Task DeleteByUserId(int userId);
    }
}