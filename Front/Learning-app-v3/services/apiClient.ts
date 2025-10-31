import axios from 'axios';
import { API_URL } from '../constants/api';
import { getAuthorizationHeader, logoutUser } from './authService';

const apiClient = axios.create({
      baseURL: API_URL,
      headers: {
            'Content-Type': 'application/json'
      }
});

/**
 * Intercepteur pour ajouter le Bearer token JWT à toutes les requêtes
 */
apiClient.interceptors.request.use(
      (config) => {
            // Récupérer le token d'authentification
            const authHeader = getAuthorizationHeader();

            // Ajouter le token Bearer à l'en-tête Authorization si disponible
            if (authHeader) {
                  config.headers.Authorization = authHeader;
            }

            return config;
      },
      (error) => {
            return Promise.reject(error);
      }
);

/**
 * Intercepteur pour gérer les réponses d'erreurs globales
 * (ex: 401 Unauthorized, 500 Internal Server Error)
 */
apiClient.interceptors.response.use(
      (response) => {
            // Passer la réponse directement si tout va bien
            return response;
      },
      (error) => {
            if (error.response) {
                  // --- Gestion spécifique des erreurs ---
                  if (error.response.status === 401) {
                        // Token expiré ou invalide
                        console.error('Authentication error (401): Token invalid or expired');
                        logoutUser();
                        window.location.href = '/login';
                  } else if (error.response.status === 403) {
                        // Accès interdit
                        console.error('Forbidden (403): You do not have permission to access this resource');
                  } else if (error.response.status === 404) {
                        console.error('Resource not found (404)');
                  } else if (error.response.status >= 500) {
                        console.error('Server error (5xx)');
                  } else {
                        // Pour les autres erreurs du client (4xx)
                        const errorMessage = error.response.data?.message || 'An error occurred';
                        console.error(`Client-side error: ${error.response.status} - ${errorMessage}`);
                  }
            } else if (error.request) {
                  // La requête a été faite mais aucune réponse n'a été reçue
                  console.error('No response received from server:', error.request);
            } else {
                  // Une erreur s'est produite lors de la configuration de la requête
                  console.error('Error in request setup:', error.message);
            }

            // Refuser la promesse pour que les composants puissent gérer l'erreur
            return Promise.reject(error);
      }
);

export default apiClient;
