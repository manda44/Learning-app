import axios from 'axios';

const API_BASE_URL = 'https://localhost:7121/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  message: string;
  success: boolean;
}

/**
 * Login user with email and password
 * @param email User email
 * @param password User password
 * @returns Promise with login response
 */
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/users/login`,
      { email, password } as LoginRequest,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Store auth token if returned (for future JWT implementation)
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }

    // Store user email for reference
    localStorage.setItem('userEmail', email);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || 'Échec de la connexion'
      );
    }
    throw error;
  }
};

/**
 * Logout user by clearing stored tokens
 */
export const logoutUser = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
};

/**
 * Check if user is authenticated
 * @returns true if user has auth token
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken') || !!localStorage.getItem('userEmail');
};

/**
 * Get stored auth token
 * @returns auth token or null
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Get stored user email
 * @returns user email or null
 */
export const getUserEmail = (): string | null => {
  return localStorage.getItem('userEmail');
};
