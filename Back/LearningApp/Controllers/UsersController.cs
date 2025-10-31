using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Application.Services;
using LearningApp.Domain;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly UserRoleService _userRoleService;
        private readonly RoleService _roleService;

        public UsersController(UserService userService, UserRoleService userRoleService,RoleService roleService)
        {
            _userService = userService;
            _userRoleService = userRoleService;
            _roleService = roleService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _userService.GetAllUsersDtosAsync();
            return Ok(users);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string query)
        {
            var users = await _userService.SearchUsersAsync(query);
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var userDto = await _userService.GetUsersByIdDtosAsync(id);
            if (userDto == null)
            {
                return NotFound();
            }
            return Ok(userDto);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> PostUser(UserCreateDto userCreateDto)
        {
            userCreateDto.Password = userCreateDto.LastName + DateTime.Now.Year;
            var user = new Users { FirstName = userCreateDto.FirstName, LastName = userCreateDto.LastName, Email = userCreateDto.Email, Password = userCreateDto.Password, CreationDate = DateTime.UtcNow };
            await _userService.CreateUserAsync(user);
            foreach(int roleId in userCreateDto.RoleIds)
            {
                var role = await _roleService.GetByIdAsync(roleId);
                if(role != null)
                {
                    var userRole = new UserRole()
                    {
                        RoleId = roleId,
                        UserId = user.UserId
                    };
                    if (user.UserId != 0) await _userRoleService.AddUserRoleAsync(userRole);
                };
            }
            var userDto = new UserDto { UserId = user.UserId, FirstName = user.FirstName, LastName = user.LastName, Email = user.Email, CreationDate = user.CreationDate };
            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, userDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutUser(int id, UserUpdateDto userUpdateDto)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound();
                }

                user.FirstName = userUpdateDto.FirstName;
                user.LastName = userUpdateDto.LastName;
                user.Email = userUpdateDto.Email;

                await _userService.UpdateUserAsync(user);
                await _userRoleService.DeleteByUserIdAsync(user.UserId);
                foreach (int roleId in userUpdateDto.RoleIds)
                {
                    await _userRoleService.AddUserRoleAsync(new UserRole()
                    {
                        RoleId = roleId,
                        UserId = user.UserId,
                        DateAdded = DateTime.Now
                    });
                }
            }
            catch(Exception ex)
            {
                return BadRequest($"Error updating user: {ex.Message}");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                await _userRoleService.DeleteByUserIdAsync(id);
                await _userService.DeleteUserAsync(id);
            }
            catch(Exception e)
            {
                return BadRequest(e.Message);
            }
            return NoContent();
        }

        [HttpPost("disable/{id}")]
        public async Task<IActionResult> DisableUser(int id)
        {
            await _userService.DisableUserAsync(id);
            return NoContent();
        }

        [HttpPost("enable/{id}")]
        public async Task<IActionResult> EnableUser(int id)
        {
            await _userService.EnableUserAsync(id);
            return NoContent();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto loginDto)
        {
            var user = (await _userService.GetAllUsersAsync()).FirstOrDefault(u => u.Email == loginDto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
            {
                return Unauthorized();
            }

            return Ok("Login successful");
        }
    }
}