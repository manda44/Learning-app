using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;
using BCrypt.Net;
using LearningApp.Application.DTOs;

namespace LearningApp.Application.Services
{
    public class UserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<Users>> GetAllUsersAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersDtosAsync()
        {
            return await _userRepository.GetAllDtosAsync();
        }
        public async Task<UserDto> GetUsersByIdDtosAsync(int userId)
        {
            return await _userRepository.GetByIdDtosAsync(userId);
        }

        public async Task<Users> GetUserByIdAsync(int id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task CreateUserAsync(Users user)
        {
            user.Password = user.Password != null ? BCrypt.Net.BCrypt.HashPassword(user.Password) : null;
            await _userRepository.AddAsync(user);
        }

        public async Task UpdateUserAsync(Users user)
        {
            await _userRepository.UpdateAsync(user);
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user != null)
            {
                await _userRepository.UpdateAsync(user);
            }
        }

        public async Task<IEnumerable<UserDto>> SearchUsersAsync(string query)
        {
            return await _userRepository.SearchUsersAsync(query);
        }

        public async Task DisableUserAsync(int userId)
        {
            await _userRepository.DisableUserAsync(userId);
        }

        public async Task EnableUserAsync(int userId)
        {
            await _userRepository.EnableUserAsync(userId);
        }
    }
}