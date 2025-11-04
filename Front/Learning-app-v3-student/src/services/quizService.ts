import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

export interface Quiz {
  quizId: number;
  chapterId: number;
  title: string;
  description: string;
  passingScore: number;
  duration: number; // in minutes
  questionCount: number;
}

export interface Question {
  questionId: number;
  quizId: number;
  content: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  points: number;
  items?: QuestionItem[];
}

export interface QuestionItem {
  questionItemId: number;
  questionId: number;
  content: string;
  isCorrect: boolean;
  order: number;
}

export interface StudentQuizAttempt {
  quizAttemptId: number;
  studentId: number;
  quizId: number;
  attemptNumber: number;
  attemptDate: string;
  score?: number; // 0-100
  status: 'in_progress' | 'passed' | 'failed';
  timeSpentSeconds?: number;
  studentQuestionResponses: StudentQuestionResponse[];
}

export interface StudentQuestionResponse {
  questionResponseId: number;
  quizAttemptId: number;
  questionId: number;
  questionItemId?: number;
  responseContent?: string;
  isCorrect?: boolean;
}

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const quizService = {
  // Get quiz by chapter
  getChapterQuiz: async (chapterId: number): Promise<Quiz | null> => {
    const response = await fetch(`${API_URL}/chapters/${chapterId}/quiz`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch quiz');
    }

    return response.json();
  },

  // Get quiz details with questions
  getQuizDetails: async (quizId: number): Promise<Quiz & { questions: Question[] }> => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz details');
    }

    return response.json();
  },

  // Get questions for a quiz
  getQuizQuestions: async (quizId: number): Promise<Question[]> => {
    const response = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz questions');
    }

    return response.json();
  },

  // Get student's quiz attempts
  getStudentQuizAttempts: async (studentId: number, quizId: number): Promise<StudentQuizAttempt[]> => {
    const response = await fetch(
      `${API_URL}/students/${studentId}/quizzes/${quizId}/attempts`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch quiz attempts');
    }

    return response.json();
  },

  // Create a new quiz attempt
  startQuizAttempt: async (studentId: number, quizId: number, chapterProgressId?: number): Promise<StudentQuizAttempt> => {
    const response = await fetch(`${API_URL}/quiz-attempts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        studentId,
        quizId,
        chapterProgressId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start quiz attempt');
    }

    return response.json();
  },

  // Submit answer to a question
  submitAnswer: async (
    quizAttemptId: number,
    questionId: number,
    response: {
      questionItemId?: number;
      responseContent?: string;
    }
  ): Promise<StudentQuestionResponse> => {
    const response_obj = await fetch(`${API_URL}/question-responses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        quizAttemptId,
        questionId,
        ...response,
      }),
    });

    if (!response_obj.ok) {
      throw new Error('Failed to submit answer');
    }

    return response_obj.json();
  },

  // Complete quiz attempt
  completeQuizAttempt: async (
    quizAttemptId: number,
    data: {
      score: number;
      status: 'passed' | 'failed';
      timeSpentSeconds: number;
    }
  ): Promise<StudentQuizAttempt> => {
    const response = await fetch(`${API_URL}/quiz-attempts/${quizAttemptId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to complete quiz attempt');
    }

    return response.json();
  },

  // Get quiz attempt details
  getQuizAttempt: async (quizAttemptId: number): Promise<StudentQuizAttempt> => {
    const response = await fetch(`${API_URL}/quiz-attempts/${quizAttemptId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz attempt');
    }

    return response.json();
  },
};

export default quizService;
