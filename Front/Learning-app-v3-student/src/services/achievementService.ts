import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

export interface Achievement {
  achievementId: number;
  name: string;
  description: string;
  icon?: string;
  points: number;
  criteria: string; // Description of how to earn this achievement
}

export interface StudentAchievement {
  studentAchievementId: number;
  studentId: number;
  achievementId: number;
  unlockedDate: string;
  achievement?: Achievement;
}

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const achievementService = {
  // Get all available achievements
  getAllAchievements: async (): Promise<Achievement[]> => {
    const response = await fetch(`${API_URL}/achievements`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch achievements');
    }

    return response.json();
  },

  // Get student's unlocked achievements
  getStudentAchievements: async (studentId: number): Promise<StudentAchievement[]> => {
    const response = await fetch(`${API_URL}/students/${studentId}/achievements`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch student achievements');
    }

    return response.json();
  },

  // Get student's total points
  getStudentPoints: async (studentId: number): Promise<number> => {
    const response = await fetch(`${API_URL}/students/${studentId}/points`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch student points');
    }

    const data = await response.json();
    return data.totalPoints || 0;
  },

  // Check if student has unlocked an achievement
  hasAchievement: async (studentId: number, achievementId: number): Promise<boolean> => {
    const response = await fetch(
      `${API_URL}/students/${studentId}/achievements/${achievementId}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    return response.ok;
  },

  // Get achievement leaderboard (top students by points)
  getLeaderboard: async (limit: number = 10): Promise<Array<{
    studentId: number;
    name: string;
    totalPoints: number;
    achievementCount: number;
  }>> => {
    const response = await fetch(`${API_URL}/leaderboard?limit=${limit}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    return response.json();
  },
};

export default achievementService;
