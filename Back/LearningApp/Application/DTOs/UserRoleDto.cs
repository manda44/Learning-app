using LearningApp.Domain;

namespace LearningApp.Application.DTOs
{
    public class UserRoleDto
    {
        public int UserId { get; set; }

        public int RoleId { get; set; }

        public DateTime DateAdded { get; set; }

        public RoleDto Role { get; set; } = null!;
    }
}
