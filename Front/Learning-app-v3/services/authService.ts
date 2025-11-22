import axios from 'axios';

const API_BASE_URL = 'https://localhost:7121/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RoleDto {
  roleId: number;
  name: string;
}

export interface UserInfo {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  creationDate?: string;
  isActive?: boolean;
  roles?: string[] | RoleDto[];
}

export interface LoginResponse {
  token?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: UserInfo;
  message: string;
  success: boolean;
}

/**
 * Login user with email and password
 * @param email User email
 * @param password User password
 * @returns Promise with login response containing JWT token
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

    // Store JWT token if returned
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('tokenType', response.data.tokenType || 'Bearer');

      // Store expiration time
      if (response.data.expiresIn) {
        const expirationTime = Date.now() + (response.data.expiresIn * 1000);
        localStorage.setItem('tokenExpiration', expirationTime.toString());
      }
    }

    // Store user info for reference
    if (response.data.user) {
      // Extract role names from RoleDto objects if they exist
      const userInfo = { ...response.data.user };
      if (response.data.user.roles && Array.isArray(response.data.user.roles)) {
        userInfo.roles = response.data.user.roles.map((role: any) =>
          typeof role === 'string' ? role : role.name
        ) as string[];
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Échec de la connexion';
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Logout user by calling backend endpoint and clearing stored tokens
 * @returns Promise indicating logout success
 */
export const logoutUser = async (): Promise<boolean> => {
  try {
    // Call backend logout endpoint for audit logging
    const authHeader = getAuthorizationHeader();
    if (authHeader) {
      await axios.post(`${API_BASE_URL}/users/logout`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      }).catch(() => {
        // If backend logout fails, continue with local logout
        console.warn('Backend logout failed, proceeding with local logout');
      });
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }

  // Clear all local authentication data
  clearAuthData();

  return true;
};

/**
 * Check if user is authenticated and token is valid (synchronous version for routing)
 * @returns true if user has a valid JWT token
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return false;
  }

  // Check if token is expired
  const expirationTime = localStorage.getItem('tokenExpiration');
  if (expirationTime && Date.now() > parseInt(expirationTime)) {
    // Token is expired - clear it immediately without waiting for backend call
    clearAuthData();
    return false;
  }

  return true;
};

/**
 * Clear all authentication data from localStorage
 * @internal
 */
const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('tokenExpiration');
};

/**
 * Get stored JWT auth token
 * @returns JWT token or null
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Get token type (usually "Bearer")
 * @returns token type or "Bearer"
 */
export const getTokenType = (): string => {
  return localStorage.getItem('tokenType') || 'Bearer';
};

/**
 * Get Authorization header value for API requests
 * @returns "Bearer <token>" or null
 */
export const getAuthorizationHeader = (): string | null => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }
  const tokenType = getTokenType();
  return `${tokenType} ${token}`;
};

/**
 * Get stored user info
 * @returns user info object or null
 */
export const getUserInfo = (): UserInfo | null => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    return null;
  }
  try {
    return JSON.parse(userInfo);
  } catch {
    return null;
  }
};

/**
 * Refresh JWT token if expired
 * This can be extended to use a refresh token endpoint in the future
 */
export const refreshToken = async (): Promise<boolean> => {
  // TODO: Implement token refresh endpoint on backend
  // For now, user needs to log in again
  return isAuthenticated();
};

/**
 * Helper to normalize roles to string array format
 */
const normalizeRoles = (roles: string[] | RoleDto[] | undefined): string[] => {
  if (!roles) return [];
  return roles.map(role => typeof role === 'string' ? role : role.name);
};

/**
 * Check if user has a specific role
 * @param role Role to check
 * @returns true if user has the role
 */
export const hasRole = (role: string): boolean => {
  const user = getUserInfo();
  if (!user || !user.roles) {
    return false;
  }
  const normalizedRoles = normalizeRoles(user.roles);
  return normalizedRoles.includes(role);
};

/**
 * Check if user has any of the provided roles
 * @param roles Array of roles to check
 * @returns true if user has at least one of the roles
 */
export const hasAnyRole = (roles: string[]): boolean => {
  const user = getUserInfo();
  if (!user || !user.roles) {
    return false;
  }
  const normalizedRoles = normalizeRoles(user.roles);
  return roles.some(role => normalizedRoles.includes(role));
};

/**
 * Check if user is Admin or Teacher
 * @returns true if user has Admin or Teacher role
 */
export const isAdminOrTeacher = (): boolean => {
  return hasAnyRole(['Admin', 'Teacher']);
};

/**
 * Check if user is Student
 * @returns true if user has Student role
 */
export const isStudent = (): boolean => {
  return hasRole('Student');
};

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Change user password
 * @param currentPassword Current password for verification
 * @param newPassword New password to set
 * @param confirmPassword Confirmation of new password
 * @returns Promise with change password response
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ChangePasswordResponse> => {
  try {
    const authHeader = getAuthorizationHeader();
    if (!authHeader) {
      throw new Error('Non authentifié');
    }

    const response = await axios.post<ChangePasswordResponse>(
      `${API_BASE_URL}/users/change-password`,
      {
        currentPassword,
        newPassword,
        confirmPassword
      } as ChangePasswordRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Erreur lors du changement de mot de passe';
      throw new Error(errorMessage);
    }
    throw error;
  }
};
