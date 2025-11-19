using LearningApp.Application.DTOs;
using LearningApp.Domain;

namespace LearningApp.Application.Interfaces
{
    public interface IUserRepository : IRepository<Users>
    {
        Task<IEnumerable<UserDto>> GetAllDtosAsync();
        Task<UserDto> GetByIdDtosAsync(int userId);
        Task<IEnumerable<UserDto>> SearchUsersAsync(string query);
        Task DisableUserAsync(int userId);
        Task EnableUserAsync(int userId);
        Task<Users> GetByIdWithRolesAsync(int userId);
    }
}