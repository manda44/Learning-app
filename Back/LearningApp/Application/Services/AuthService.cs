using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LearningApp.Application.Settings;
using LearningApp.Domain;
using Microsoft.IdentityModel.Tokens;

namespace LearningApp.Application.Services
{
    /// <summary>
    /// Service pour gérer l'authentification et les tokens JWT
    /// </summary>
    public class AuthService
    {
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<AuthService> _logger;

        public AuthService(JwtSettings jwtSettings, ILogger<AuthService> logger)
        {
            _jwtSettings = jwtSettings ?? throw new ArgumentNullException(nameof(jwtSettings));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Génère un JWT token pour un utilisateur authentifié
        /// </summary>
        /// <param name="user">L'utilisateur authentifié</param>
        /// <param name="roles">Liste des rôles de l'utilisateur (optionnel)</param>
        /// <returns>Le token JWT signé</returns>
        public string GenerateJwtToken(Users user, IEnumerable<string>? roles = null)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            if (string.IsNullOrEmpty(_jwtSettings.SecretKey))
            {
                throw new InvalidOperationException("JWT Secret Key is not configured");
            }

            // Créer la clé de signature
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Créer les claims (informations à inclure dans le token)
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName)
            };

            // Ajouter les rôles comme claims
            if (roles != null)
            {
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
            }

            // Créer le token
            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),
                signingCredentials: credentials
            );

            // Sérialiser le token en string
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.WriteToken(token);

            _logger.LogInformation($"JWT token généré pour l'utilisateur: {user.Email}");

            return jwtToken;
        }

        /// <summary>
        /// Valide un JWT token
        /// </summary>
        /// <param name="token">Le token à valider</param>
        /// <returns>True si le token est valide, false sinon</returns>
        public bool ValidateJwtToken(string token)
        {
            try
            {
                if (string.IsNullOrEmpty(_jwtSettings.SecretKey))
                {
                    return false;
                }

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
                var tokenHandler = new JwtSecurityTokenHandler();

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"JWT token validation failed: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Extrait les claims d'un JWT token
        /// </summary>
        /// <param name="token">Le token JWT</param>
        /// <returns>Les claims extraits du token</returns>
        public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            try
            {
                if (string.IsNullOrEmpty(_jwtSettings.SecretKey))
                {
                    return null;
                }

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
                var tokenHandler = new JwtSecurityTokenHandler();

                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = _jwtSettings.Audience,
                    ValidateLifetime = false, // Accepte les tokens expirés
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return principal;
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Failed to extract principal from token: {ex.Message}");
                return null;
            }
        }
    }
}
