import apiClient from './apiClient';

export interface StudentCourseEnrollmentDetail {
  enrollmentId: number;
  studentId: number;
  courseId: number;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'dropped';
  progressPercentage: number;
  completionDate?: string;
  student?: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  course?: {
    courseId: number;
    title: string;
    description: string;
  };
}

export const enrollmentService = {
  // Get all student enrollments (for admin view)
  getAllEnrollments: async (): Promise<StudentCourseEnrollmentDetail[]> => {
    const response = await apiClient.get('/enrollments/all');
    return response.data;
  },

  // Get enrollments by status
  getEnrollmentsByStatus: async (status: string): Promise<StudentCourseEnrollmentDetail[]> => {
    const response = await apiClient.get(`/enrollments/status/${status}`);
    return response.data;
  },

  // Get enrollments for a specific student
  getStudentEnrollments: async (studentId: number): Promise<StudentCourseEnrollmentDetail[]> => {
    const response = await apiClient.get(`/students/${studentId}/enrollments`);
    return response.data;
  },

  // Get enrollments for a specific course
  getCourseEnrollments: async (courseId: number): Promise<StudentCourseEnrollmentDetail[]> => {
    const response = await apiClient.get(`/courses/${courseId}/enrollments`);
    return response.data;
  },
};

export default enrollmentService;
