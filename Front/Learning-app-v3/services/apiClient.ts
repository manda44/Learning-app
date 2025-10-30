import axios from 'axios';
import { API_URL } from '../constants/api';

const apiClient = axios.create({
      baseURL: API_URL,
      headers: {
            'content-Type': 'application/json'
      }
});
// Intercepteur pour gérer les réponses d'erreurs globales (ex: 401 Unauthorized, 500 Internal Server Error)
apiClient.interceptors.response.use(
      (response) => {
            // Passer la réponse directement si tout va bien
            return response;
      },
      (error) => {
            const expectedError =
                  error.response && error.response.status >= 400 && error.response.status < 500;

            if (error.response) {
                  // --- Gestion spécifique des erreurs ---
                  if (error.response.status === 401) {
                        console.error('Authentication error: Redirecting to login...');
                        // Ici, vous pourriez déclencher une action pour déconnecter l'utilisateur
                        // ou rediriger vers la page de connexion.
                        // localStorage.removeItem('authToken');
                        // window.location.href = '/login'; // Redirection simple
                  } else if (error.response.status === 404) {
                        console.error('Resource not found (404)');
                  } else if (error.response.status >= 500) {
                        console.error('Server error (5xx)');
                        // On peut aussi afficher un message plus général à l'utilisateur
                        // toast.error("An unexpected server error occurred. Please try again later.");
                  } else {
                        // Pour les autres erreurs du client (4xx)
                        const errorMessage = error.response.data?.message || 'An error occurred';
                        console.error(`Client-side error: ${error.response.status} - ${errorMessage}`);
                        // toast.error(errorMessage); // Utilisation d'une librairie de notification comme react-toastify
                  }
            } else if (error.request) {
                  // La requête a été faite mais aucune réponse n'a été reçue
                  console.error('No response received from server:', error.request);
                  // toast.error("Could not connect to the server. Please check your internet connection.");
            } else {
                  // Une erreur s'est produite lors de la configuration de la requête
                  console.error('Error in request setup:', error.message);
                  // toast.error("An internal error occurred.");
            }

            // Refuser la promesse pour que les composants puissent gérer l'erreur
            return Promise.reject(error);
      }
);

export default apiClient;
