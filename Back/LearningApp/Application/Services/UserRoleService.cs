using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using System.Threading.Tasks;

namespace LearningApp.Application.Services
{
    public class UserRoleService
    {
        private readonly IUserRoleRepository _userRoleRepository;

        public UserRoleService(IUserRoleRepository userRoleRepository)
        {
            _userRoleRepository = userRoleRepository;
        }

        public async Task AddUserRoleAsync(UserRole userRole)
        {
            await _userRoleRepository.AddAsync(userRole);
        }
        public async Task DeleteByUserIdAsync(int userId)
        {
            await _userRoleRepository.DeleteByUserId(userId);
        }
    }
}