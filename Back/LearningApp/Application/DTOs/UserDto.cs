
using LearningApp.Domain;

namespace LearningApp.Application.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateTime? CreationDate { get; set; }
        public bool IsActive { get; set; }

        public List<RoleDto>? Roles { get; set; }
    }
}
