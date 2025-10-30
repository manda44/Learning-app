using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Infrastructure.Repositories
{
    public class UserRoleRepository : Repository<UserRole>, IUserRoleRepository
    {
        public UserRoleRepository(ApplicationDbContext context) : base(context) { }

        public async Task DeleteByUserId(int userId)
        {
            var userRoles = await _context.UserRoles
                .Where(x => x.UserId == userId)
                .ToListAsync();
            _context.RemoveRange(userRoles);
            await _context.SaveChangesAsync();
        }
    }
}