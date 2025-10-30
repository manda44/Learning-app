
namespace LearningApp.Application.DTOs
{
    public class UserUpdateDto
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Password { get; set; } = null!;
        public List<int> RoleIds { get; set; }
    }
}
