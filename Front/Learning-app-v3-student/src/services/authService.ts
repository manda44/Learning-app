// Authentication service for student login/logout
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

export interface UserInfo {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const MOCK_USER: UserInfo = {
  id: 1,
  email: 'student@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
  role: 'student',
};

export const authService = {
  // Get user info from localStorage
  getUserInfo: (): UserInfo | null => {
    const userStr = localStorage.getItem('userInfo');
    if (!userStr) {
      // Return mock user if no user in localStorage (for demo)
      return MOCK_USER;
    }
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return MOCK_USER;
    }
  },

  // Get auth token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Login user and store token and user info
  login: async (email: string, password: string): Promise<UserInfo> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data.user));
    return data.user;
  },

  // Logout user and clear stored data
  logoutUser: async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('studentNavbarOpened');
    localStorage.removeItem('appColorScheme');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};

// Export convenience functions for backwards compatibility
export const getUserInfo = authService.getUserInfo;
export const logoutUser = authService.logoutUser;
export const getToken = authService.getToken;
