namespace LearningApp.Application.DTOs
{
    /// <summary>
    /// DTO pour la réponse du login
    /// Contient le token JWT et les informations de l'utilisateur
    /// </summary>
    public class LoginResponseDto
    {
        /// <summary>
        /// Le token JWT à utiliser pour les requêtes authentifiées
        /// </summary>
        public string? Token { get; set; }

        /// <summary>
        /// Type de token (Bearer)
        /// </summary>
        public string TokenType { get; set; } = "Bearer";

        /// <summary>
        /// Durée de vie du token en secondes
        /// </summary>
        public int ExpiresIn { get; set; }

        /// <summary>
        /// Informations de l'utilisateur authentifié
        /// </summary>
        public UserDto? User { get; set; }

        /// <summary>
        /// Message de succès/erreur
        /// </summary>
        public string? Message { get; set; }

        /// <summary>
        /// Indique si l'authentification est réussie
        /// </summary>
        public bool Success { get; set; }
    }
}
