using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Infrastructure.Repositories
{
    public class UserRepository : Repository<Users> ,IUserRepository
    {

        public UserRepository(ApplicationDbContext context) : base(context) { }

        async Task<IEnumerable<UserDto>> IUserRepository.GetAllDtosAsync()
        {
            var users = await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Select(u => new UserDto
                {
                    CreationDate = DateTime.Now,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    UserId = u.UserId,
                    IsActive = u.IsActive,
                    Roles = u.UserRoles.Select(ur => new RoleDto
                    {
                        Name = ur.Role.Name,
                        RoleId = ur.Role.RoleId
                    }).ToList()
                })
                .ToListAsync();
            return users;
        }
        async Task<UserDto> IUserRepository.GetByIdDtosAsync(int userId)
        {
            var users = await _context.Users
                .Where(u=> u.UserId == userId)
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Select(u => new UserDto
                {
                    CreationDate = DateTime.Now,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    UserId = u.UserId,
                    IsActive = u.IsActive,
                    Roles = u.UserRoles.Select(ur => new RoleDto
                    {
                        Name = ur.Role.Name,
                        RoleId = ur.Role.RoleId
                    }).ToList()
                })
                .FirstOrDefaultAsync();
            return users;
        }

        public async Task<IEnumerable<UserDto>> SearchUsersAsync(string query)
        {
            var lowerQuery = query.ToLower();
            var users = await _context.Users
                .Where(u => u.FirstName.ToLower().Contains(lowerQuery) ||
                            u.LastName.ToLower().Contains(lowerQuery) ||
                            u.Email.ToLower().Contains(lowerQuery))
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .Select(u => new UserDto
                {
                    CreationDate = u.CreationDate,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    UserId = u.UserId,
                    IsActive = u.IsActive,
                    Roles = u.UserRoles.Select(ur => new RoleDto
                    {
                        Name = ur.Role.Name,
                        RoleId = ur.Role.RoleId
                    }).ToList()
                })
                .ToListAsync();
            return users;
        }

        public async Task DisableUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.IsActive = false;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task EnableUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                user.IsActive = true;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Users> GetByIdWithRolesAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }
    }
}