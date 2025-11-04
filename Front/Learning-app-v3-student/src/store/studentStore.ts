import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import courseService from '../services/courseService';
import projectService from '../services/projectService';
import quizService from '../services/quizService';
import type { StudentCourseEnrollment, Course, CourseWithEnrollment } from '../services/courseService';
import type { StudentProjectEnrollment } from '../services/projectService';
import type { StudentQuizAttempt } from '../services/quizService';
import type { StudentAchievement } from '../services/achievementService';
import { MOCK_COURSES, MOCK_ENROLLMENTS } from '../mocks/courses';

interface StudentState {
  // Course state
  enrollments: StudentCourseEnrollment[];
  courses: Course[];
  coursesWithEnrollment: CourseWithEnrollment[];
  selectedCourse: StudentCourseEnrollment | null;
  coursesLoading: boolean;
  coursesError: string | null;

  // Project state
  projects: StudentProjectEnrollment[];
  selectedProject: StudentProjectEnrollment | null;
  projectsLoading: boolean;
  projectsError: string | null;

  // Quiz state
  quizAttempts: Map<number, StudentQuizAttempt[]>;
  currentQuizAttempt: StudentQuizAttempt | null;
  quizLoading: boolean;
  quizError: string | null;

  // Achievement state
  achievements: StudentAchievement[];
  totalPoints: number;
  achievementsLoading: boolean;
  achievementsError: string | null;

  // Loading state
  isInitialized: boolean;

  // Actions
  fetchStudentCourses: (studentId: number) => Promise<void>;
  fetchAllCourses: () => Promise<void>;
  fetchAllCoursesWithEnrollment: (studentId: number) => Promise<void>;
  enrollCourse: (studentId: number, courseId: number) => Promise<void>;
  selectCourse: (enrollment: StudentCourseEnrollment | null) => void;

  fetchStudentProjects: (studentId: number) => Promise<void>;
  enrollProject: (studentId: number, projectId: number, repoUrl?: string) => Promise<void>;
  selectProject: (project: StudentProjectEnrollment | null) => void;

  fetchQuizAttempts: (studentId: number, quizId: number) => Promise<void>;
  startQuizAttempt: (studentId: number, quizId: number, chapterProgressId?: number) => Promise<void>;
  setCurrentQuizAttempt: (attempt: StudentQuizAttempt | null) => void;

  fetchAchievements: (studentId: number) => Promise<void>;
  fetchStudentPoints: () => Promise<void>;

  resetState: () => void;
}

const initialState = {
  enrollments: [],
  courses: [],
  coursesWithEnrollment: [], // Will be populated from API, not from mock
  selectedCourse: null,
  coursesLoading: false,
  coursesError: null,

  projects: [],
  selectedProject: null,
  projectsLoading: false,
  projectsError: null,

  quizAttempts: new Map(),
  currentQuizAttempt: null,
  quizLoading: false,
  quizError: null,

  achievements: [],
  totalPoints: 0,
  achievementsLoading: false,
  achievementsError: null,

  isInitialized: false,
};

export const useStudentStore = create<StudentState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Course actions
        fetchStudentCourses: async (studentId: number) => {
          set({ coursesLoading: true, coursesError: null });
          try {
            // Use mock data for student enrollments (static)
            const enrollments = MOCK_ENROLLMENTS.filter(e => e.studentId === studentId) as StudentCourseEnrollment[];
            set({ enrollments, coursesLoading: false });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to fetch courses';
            set({ coursesError: errorMsg, coursesLoading: false });
          }
        },

        fetchAllCourses: async () => {
          set({ coursesLoading: true, coursesError: null });
          try {
            // Use mock courses data (static)
            set({ courses: MOCK_COURSES, coursesLoading: false });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to fetch courses';
            set({ coursesError: errorMsg, coursesLoading: false });
          }
        },

        fetchAllCoursesWithEnrollment: async (studentId: number) => {
          set({ coursesLoading: true, coursesError: null });
          try {
            // Fetch all courses with enrollment status for the student from the API
            const coursesWithEnrollment = await courseService.getAllCoursesWithEnrollment(studentId);
            set({ coursesWithEnrollment, coursesLoading: false });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to fetch courses with enrollment';
            set({ coursesError: errorMsg, coursesLoading: false });
          }
        },

        enrollCourse: async (studentId: number, courseId: number) => {
          set({ coursesLoading: true, coursesError: null });
          try {
            // Create mock enrollment (static)
            const course = MOCK_COURSES.find(c => c.courseId === courseId);
            if (!course) throw new Error('Course not found');

            const newEnrollment = {
              enrollmentId: Math.random(),
              studentId,
              courseId,
              enrollmentDate: new Date().toISOString(),
              status: 'active' as const,
              progress: 0,
              course,
            };
            const enrollments = get().enrollments;
            set({ enrollments: [...enrollments, newEnrollment], coursesLoading: false });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to enroll in course';
            set({ coursesError: errorMsg, coursesLoading: false });
          }
        },

        selectCourse: (enrollment) => {
          set({ selectedCourse: enrollment });
        },

        // Project actions
        fetchStudentProjects: async (studentId: number) => {
          set({ projectsLoading: true, projectsError: null });
          try {
            const projects = await projectService.getStudentProjects(studentId);
            set({ projects, projectsLoading: false });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to fetch projects';
            set({ projectsError: errorMsg, projectsLoading: false });
          }
        },

        enrollProject: async (studentId: number, projectId: number, repoUrl?: string) => {
          set({ projectsLoading: true, projectsError: null });
          try {
            const project = await projectService.enrollInProject(studentId, projectId, repoUrl);
            const projects = get().projects;
            set({ projects: [...projects, project], projectsLoading: false });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to enroll in project';
            set({ projectsError: errorMsg, projectsLoading: false });
          }
        },

        selectProject: (project) => {
          set({ selectedProject: project });
        },

        // Quiz actions
        fetchQuizAttempts: async (studentId: number, quizId: number) => {
          set({ quizLoading: true, quizError: null });
          try {
            const attempts = await quizService.getStudentQuizAttempts(studentId, quizId);
            const quizAttempts = new Map(get().quizAttempts);
            quizAttempts.set(quizId, attempts);
            set({ quizAttempts, quizLoading: false });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to fetch quiz attempts';
            set({ quizError: errorMsg, quizLoading: false });
          }
        },

        startQuizAttempt: async (studentId: number, quizId: number, chapterProgressId?: number) => {
          set({ quizLoading: true, quizError: null });
          try {
            const attempt = await quizService.startQuizAttempt(studentId, quizId, chapterProgressId);
            set({ currentQuizAttempt: attempt, quizLoading: false });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to start quiz';
            set({ quizError: errorMsg, quizLoading: false });
          }
        },

        setCurrentQuizAttempt: (attempt) => {
          set({ currentQuizAttempt: attempt });
        },

        // Achievement actions
        fetchAchievements: async (studentId: number) => {
          set({ achievementsLoading: true, achievementsError: null });
          try {
            // Use mock achievements for now
            const mockAchievements = [
              {
                studentAchievementId: 1,
                studentId,
                achievementId: 1,
                unlockedDate: '2024-02-10T10:00:00Z',
                achievement: {
                  achievementId: 1,
                  name: 'First Steps',
                  description: 'Complete your first course chapter',
                  icon: '🚀',
                  points: 100,
                  criteria: 'Complete first chapter',
                },
              },
              {
                studentAchievementId: 2,
                studentId,
                achievementId: 2,
                unlockedDate: '2024-02-12T10:00:00Z',
                achievement: {
                  achievementId: 2,
                  name: 'Quiz Master',
                  description: 'Score 100% on a quiz',
                  icon: '🎯',
                  points: 150,
                  criteria: 'Perfect quiz score',
                },
              },
              {
                studentAchievementId: 3,
                studentId,
                achievementId: 3,
                unlockedDate: '2024-02-15T10:00:00Z',
                achievement: {
                  achievementId: 3,
                  name: 'Course Complete',
                  description: 'Finish a full course',
                  icon: '🏆',
                  points: 250,
                  criteria: 'Complete course',
                },
              },
            ];
            set({ achievements: mockAchievements, achievementsLoading: false });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to fetch achievements';
            set({ achievementsError: errorMsg, achievementsLoading: false });
          }
        },

        fetchStudentPoints: async () => {
          set({ achievementsLoading: true, achievementsError: null });
          try {
            // Use mock points for now
            set({ totalPoints: 2450, achievementsLoading: false });
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to fetch points';
            set({ achievementsError: errorMsg, achievementsLoading: false });
          }
        },

        // Utility actions
        resetState: () => {
          set(initialState);
        },
      }),
      {
        name: 'student-store',
        partialize: (state) => ({
          enrollments: state.enrollments,
          courses: state.courses,
          // NOTE: coursesWithEnrollment is NOT persisted - always fetched fresh from API
          projects: state.projects,
          achievements: state.achievements,
          totalPoints: state.totalPoints,
        }),
      }
    )
  )
);

export default useStudentStore;
