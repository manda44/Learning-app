const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

interface StudentOverview {
  totalCourses: number;
  completedCourses: number;
  activeCourses: number;
  pausedCourses: number;
  totalQuizzes: number;
  passedQuizzes: number;
  totalChapters: number;
  completedChapters: number;
  averageQuizScore: number;
  totalStudyHours: number;
  completionRate: number;
}

interface CourseProgress {
  id: number;
  name: string;
  progress: number;
  status: string;
  color: string;
}

interface MonthlyActivity {
  month: string;
  completed: number;
  attempted: number;
}

interface QuizPerformance {
  name: string;
  value: number;
  fill: string;
}

interface ChapterProgression {
  name: string;
  progress: number;
  status: string;
  startDate: string;
  completedDate: string | null;
}

interface TimeSpent {
  course: string;
  hours: number;
  minutes: number;
}

interface StudentSummary {
  lastUpdated: string;
  statistics: StudentOverview;
  recommendation: string;
}

const statisticsService = {
  /**
   * Get student overview statistics
   */
  async getStudentOverview(studentId: number): Promise<StudentOverview> {
    try {
      const response = await fetch(`${API_URL}/StudentStatistics/overview/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student overview');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching student overview:', error);
      throw error;
    }
  },

  /**
   * Get course progress data for chart
   */
  async getCourseProgressData(studentId: number): Promise<CourseProgress[]> {
    try {
      const response = await fetch(`${API_URL}/StudentStatistics/course-progress/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course progress data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching course progress data:', error);
      throw error;
    }
  },

  /**
   * Get monthly activity data for chart
   */
  async getMonthlyActivityData(studentId: number): Promise<MonthlyActivity[]> {
    try {
      const response = await fetch(`${API_URL}/StudentStatistics/monthly-activity/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch monthly activity data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching monthly activity data:', error);
      throw error;
    }
  },

  /**
   * Get quiz performance distribution
   */
  async getQuizPerformanceData(studentId: number): Promise<QuizPerformance[]> {
    try {
      const response = await fetch(`${API_URL}/StudentStatistics/quiz-performance/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz performance data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching quiz performance data:', error);
      throw error;
    }
  },

  /**
   * Get chapter progression data
   */
  async getChapterProgressionData(studentId: number): Promise<ChapterProgression[]> {
    try {
      const response = await fetch(`${API_URL}/StudentStatistics/chapter-progression/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chapter progression data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching chapter progression data:', error);
      throw error;
    }
  },

  /**
   * Get time spent learning by course
   */
  async getTimeSpentData(studentId: number): Promise<TimeSpent[]> {
    try {
      const response = await fetch(`${API_URL}/StudentStatistics/time-spent/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch time spent data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching time spent data:', error);
      throw error;
    }
  },

  /**
   * Get overall learning statistics summary
   */
  async getStudentSummary(studentId: number): Promise<StudentSummary> {
    try {
      const response = await fetch(`${API_URL}/StudentStatistics/summary/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student summary');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching student summary:', error);
      throw error;
    }
  }
};

export default statisticsService;

export type {
  StudentOverview,
  CourseProgress,
  MonthlyActivity,
  QuizPerformance,
  ChapterProgression,
  TimeSpent,
  StudentSummary
};
