import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

export interface Course {
  courseId: number;
  title: string;
  description: string;
  level: string;
  duration: number;
  image?: string;
  createdAt: string;
}

export interface StudentCourseEnrollment {
  enrollmentId: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'dropped';
  progress: number; // 0-100
  course?: Course;
}

export interface Chapter {
  chapterId: number;
  courseId: number;
  title: string;
  description: string;
  order: number;
  hasQuiz: boolean;
}

export interface ContentBlock {
  contentId: number;
  type: string; // "text", "video", "image", "heading", etc.
  data?: string; // Content data (can be JSON for structured content)
  order: number;
  createdAt: string;
}

export interface StudentChapterProgress {
  progressId: number;
  studentId: number;
  chapterId: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number; // 0-100
  startedDate?: string;
  completedDate?: string;
}

export interface ChapterDetail {
  chapterId: number;
  title: string;
  description?: string;
  order: number;
  color: string;
  createdAt: string;
  courseId: number;
  courseTitle?: string;
  contentBlocks: ContentBlock[];
  studentProgress?: StudentChapterProgress;
}

export interface ChapterListItem {
  chapterId: number;
  title: string;
  description?: string;
  order: number;
  color: string;
  contentCount: number;
  hasQuiz: boolean;
  quizId?: number;
  studentProgress?: StudentChapterProgress;
}

export interface QuizItem {
  quizId: number;
  title: string;
  description?: string;
  chapterId: number;
  order: number;
  successPercentage: number;
}

export type CourseNavItem = ChapterListItem | QuizItem;

export const isChapter = (item: CourseNavItem): item is ChapterListItem => {
  return 'chapterId' in item && 'contentCount' in item;
};

export const isQuiz = (item: CourseNavItem): item is QuizItem => {
  return 'quizId' in item && 'successPercentage' in item;
};

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface CourseWithEnrollment extends Course {
  enrollmentId?: number | null;
  enrollmentDate?: string | null;
  status?: string | null;
  progressPercentage?: number | null;
  completionDate?: string | null;
  isEnrolled: boolean;
}

export const courseService = {
  // Get all courses with enrollment status for a student
  getAllCoursesWithEnrollment: async (studentId: number): Promise<CourseWithEnrollment[]> => {
    const response = await fetch(`${API_URL}/courses/with-enrollment/${studentId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses with enrollment');
    }

    return response.json();
  },

  // Get all courses available to student
  getAllCourses: async (): Promise<Course[]> => {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    return response.json();
  },

  // Get student's enrolled courses
  getStudentCourses: async (studentId: number): Promise<StudentCourseEnrollment[]> => {
    const response = await fetch(`${API_URL}/enrollments/student/${studentId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch student courses');
    }

    return response.json();
  },

  // Get course details with chapters
  getCourseDetails: async (courseId: number): Promise<Course & { chapters: Chapter[] }> => {
    const response = await fetch(`${API_URL}/courses/${courseId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course details');
    }

    return response.json();
  },

  // Enroll student in a course
  enrollInCourse: async (studentId: number, courseId: number): Promise<StudentCourseEnrollment> => {
    const response = await fetch(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        studentId,
        courseId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to enroll in course');
    }

    return response.json();
  },

  // Get course chapters
  getChapters: async (courseId: number): Promise<Chapter[]> => {
    const response = await fetch(`${API_URL}/courses/${courseId}/chapters`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chapters');
    }

    return response.json();
  },

  // Get chapter details
  getChapterDetails: async (chapterId: number): Promise<Chapter> => {
    const response = await fetch(`${API_URL}/chapters/${chapterId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chapter details');
    }

    return response.json();
  },

  // Get complete chapter details with all content blocks for student view
  getChapterDetailWithContent: async (chapterId: number, studentId: number): Promise<ChapterDetail> => {
    const response = await fetch(`${API_URL}/chapters/${chapterId}/detail/${studentId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chapter details with content');
    }

    return response.json();
  },

  // Get all chapters in a course with content count and student progress for student view
  // Returns a mixed list of chapters and quizzes
  getCourseChaptersWithContent: async (courseId: number, studentId: number): Promise<CourseNavItem[]> => {
    const response = await fetch(`${API_URL}/chapters/course/${courseId}/with-content/${studentId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chapters with content');
    }

    return response.json();
  },
};

export default courseService;
