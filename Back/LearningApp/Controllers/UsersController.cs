using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Application.Services;
using LearningApp.Domain;
using Microsoft.AspNetCore.Authorization;
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
        private readonly AuthService _authService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(UserService userService, UserRoleService userRoleService, RoleService roleService, AuthService authService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _userRoleService = userRoleService;
            _roleService = roleService;
            _authService = authService;
            _logger = logger;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            var users = await _userService.GetAllUsersDtosAsync();
            return Ok(users);
        }

        [Authorize]
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string query)
        {
            var users = await _userService.SearchUsersAsync(query);
            return Ok(users);
        }

        [Authorize]
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

        [Authorize]
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

        [Authorize]
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

        [Authorize]
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

        [Authorize]
        [HttpPost("disable/{id}")]
        public async Task<IActionResult> DisableUser(int id)
        {
            await _userService.DisableUserAsync(id);
            return NoContent();
        }

        [Authorize]
        [HttpPost("enable/{id}")]
        public async Task<IActionResult> EnableUser(int id)
        {
            await _userService.EnableUserAsync(id);
            return NoContent();
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto loginDto)
        {
            try
            {
                // Valider les entrées
                if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
                {
                    return BadRequest(new LoginResponseDto
                    {
                        Success = false,
                        Message = "Email et mot de passe sont requis"
                    });
                }

                // Chercher l'utilisateur (optimisé : ne cherche qu'un)
                var user = (await _userService.GetAllUsersAsync())
                    .FirstOrDefault(u => u.Email == loginDto.Email && u.IsActive);

                if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
                {
                    _logger.LogWarning($"Tentative de connexion échouée pour: {loginDto.Email}");
                    return Unauthorized(new LoginResponseDto
                    {
                        Success = false,
                        Message = "Email ou mot de passe incorrect"
                    });
                }

                // Charger les rôles de l'utilisateur avec eager loading
                user = await _userService.GetUserByIdWithRolesAsync(user.UserId);

                // Récupérer les rôles de l'utilisateur
                var userRoles = user?.UserRoles?.Select(ur => ur.Role?.Name ?? "Unknown").ToList() ?? new List<string>();

                // Générer le JWT token
                var jwtToken = _authService.GenerateJwtToken(user, userRoles);

                // Créer la réponse
                var userDto = new UserDto
                {
                    UserId = user.UserId,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    CreationDate = user.CreationDate,
                    IsActive = user.IsActive,
                    Roles = user.UserRoles?.Select(ur => new RoleDto
                    {
                        RoleId = ur.Role?.RoleId ?? 0,
                        Name = ur.Role?.Name ?? "Unknown"
                    }).ToList() ?? new List<RoleDto>()
                };

                var loginResponse = new LoginResponseDto
                {
                    Token = jwtToken,
                    TokenType = "Bearer",
                    ExpiresIn = 3600, // 60 minutes en secondes
                    User = userDto,
                    Message = "Authentification réussie",
                    Success = true
                };

                _logger.LogInformation($"Utilisateur authentifié avec succès: {user.Email}");
                return Ok(loginResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur lors du login: {ex.Message}");
                return StatusCode(500, new LoginResponseDto
                {
                    Success = false,
                    Message = "Une erreur est survenue lors de l'authentification"
                });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            try
            {
                // Récupérer l'email de l'utilisateur depuis les claims du token
                var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "Unknown";
                _logger.LogInformation($"Utilisateur déconnecté: {userEmail}");

                return Ok(new
                {
                    Success = true,
                    Message = "Déconnexion réussie"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur lors de la déconnexion: {ex.Message}");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Une erreur est survenue lors de la déconnexion"
                });
            }
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            try
            {
                // Valider les entrées
                if (string.IsNullOrEmpty(changePasswordDto.CurrentPassword) ||
                    string.IsNullOrEmpty(changePasswordDto.NewPassword) ||
                    string.IsNullOrEmpty(changePasswordDto.ConfirmPassword))
                {
                    return BadRequest(new ChangePasswordResponseDto
                    {
                        Success = false,
                        Message = "Tous les champs sont requis"
                    });
                }

                // Vérifier que les nouveaux mots de passe correspondent
                if (changePasswordDto.NewPassword != changePasswordDto.ConfirmPassword)
                {
                    return BadRequest(new ChangePasswordResponseDto
                    {
                        Success = false,
                        Message = "Les mots de passe ne correspondent pas"
                    });
                }

                // Vérifier la longueur minimale
                if (changePasswordDto.NewPassword.Length < 8)
                {
                    return BadRequest(new ChangePasswordResponseDto
                    {
                        Success = false,
                        Message = "Le nouveau mot de passe doit contenir au moins 8 caractères"
                    });
                }

                // Récupérer l'ID utilisateur depuis les claims du token
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new ChangePasswordResponseDto
                    {
                        Success = false,
                        Message = "Utilisateur non authentifié"
                    });
                }

                // Récupérer l'utilisateur
                var user = await _userService.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new ChangePasswordResponseDto
                    {
                        Success = false,
                        Message = "Utilisateur non trouvé"
                    });
                }

                // Vérifier le mot de passe actuel
                if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.Password))
                {
                    _logger.LogWarning($"Tentative de changement de mot de passe échouée pour l'utilisateur: {user.Email}");
                    return Unauthorized(new ChangePasswordResponseDto
                    {
                        Success = false,
                        Message = "Le mot de passe actuel est incorrect"
                    });
                }

                // Vérifier que le nouveau mot de passe est différent de l'ancien
                if (BCrypt.Net.BCrypt.Verify(changePasswordDto.NewPassword, user.Password))
                {
                    return BadRequest(new ChangePasswordResponseDto
                    {
                        Success = false,
                        Message = "Le nouveau mot de passe doit être différent de l'ancien"
                    });
                }

                // Hasher le nouveau mot de passe
                user.Password = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);

                // Mettre à jour l'utilisateur
                await _userService.UpdateUserAsync(user);

                _logger.LogInformation($"Mot de passe changé avec succès pour l'utilisateur: {user.Email}");
                return Ok(new ChangePasswordResponseDto
                {
                    Success = true,
                    Message = "Mot de passe changé avec succès"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erreur lors du changement de mot de passe: {ex.Message}");
                return StatusCode(500, new ChangePasswordResponseDto
                {
                    Success = false,
                    Message = "Une erreur est survenue lors du changement de mot de passe"
                });
            }
        }
    }
}