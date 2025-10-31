namespace LearningApp.Application.Settings
{
    /// <summary>
    /// Configuration pour JWT (JSON Web Tokens)
    /// </summary>
    public class JwtSettings
    {
        /// <summary>
        /// Clé secrète pour signer les tokens JWT
        /// IMPORTANT: À générer et sécuriser en production
        /// </summary>
        public string? SecretKey { get; set; }

        /// <summary>
        /// Issuer du token (qui l'a créé)
        /// Exemple: "LearningApp"
        /// </summary>
        public string? Issuer { get; set; }

        /// <summary>
        /// Audience du token (pour qui c'est)
        /// Exemple: "LearningApp-Users"
        /// </summary>
        public string? Audience { get; set; }

        /// <summary>
        /// Durée de vie du token en minutes
        /// Exemple: 60 (1 heure)
        /// </summary>
        public int ExpirationMinutes { get; set; }
    }
}
