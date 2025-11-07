import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

export interface ChapterWithLockStatus {
  chapterId: number;
  title: string;
  description?: string;
  order: number;
  color: string;
  isLocked: boolean;
  isCompleted: boolean;
  hasQuiz: boolean;
  quizId?: number;
  quizPassed: boolean;
  quizLocked: boolean;
  lastQuizScore?: number;
  progressPercentage: number;
}

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const chapterProgressService = {
  // Mark a chapter as completed
  markChapterAsCompleted: async (studentId: number, chapterId: number): Promise<any> => {
    const response = await fetch(`${API_URL}/StudentChapterProgress/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        studentId,
        chapterId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark chapter as completed');
    }

    return response.json();
  },

  // Get all chapters with their lock status for a student
  getChaptersWithLockStatus: async (courseId: number, studentId: number): Promise<ChapterWithLockStatus[]> => {
    const response = await fetch(
      `${API_URL}/StudentChapterProgress/course/${courseId}/student/${studentId}/lock-status`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chapter lock status');
    }

    return response.json();
  },

  // Check if a chapter is accessible for a student
  isChapterAccessible: async (chapterId: number, studentId: number): Promise<boolean> => {
    const response = await fetch(
      `${API_URL}/StudentChapterProgress/chapter/${chapterId}/student/${studentId}/accessible`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check chapter accessibility');
    }

    const data = await response.json();
    return data.accessible;
  },
};

export default chapterProgressService;
