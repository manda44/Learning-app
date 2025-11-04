import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

export interface MiniProject {
  projectId: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  gitRepo?: string;
}

export interface CourseMiniProject {
  courseMiniProjectId: number;
  courseId: number;
  projectId: number;
  order: number;
  project?: MiniProject;
}

export interface Ticket {
  ticketId: number;
  projectId: number;
  title: string;
  description: string;
  acceptanceCriteria: string;
  points: number;
  status: string;
}

export interface StudentProjectEnrollment {
  enrollmentId: number;
  studentId: number;
  projectId: number;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'abandoned';
  progress: number; // 0-100
  repositoryUrl?: string;
}

export interface StudentTicketProgress {
  progressId: number;
  studentId: number;
  ticketId: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress: number; // 0-100
  completedDate?: string;
  notes?: string;
}

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const projectService = {
  // Get all mini projects for a course
  getCourseProjects: async (courseId: number): Promise<CourseMiniProject[]> => {
    const response = await fetch(`${API_URL}/courses/${courseId}/projects`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course projects');
    }

    return response.json();
  },

  // Get student's project enrollments
  getStudentProjects: async (studentId: number): Promise<StudentProjectEnrollment[]> => {
    const response = await fetch(`${API_URL}/students/${studentId}/projects`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch student projects');
    }

    return response.json();
  },

  // Get project details with tickets
  getProjectDetails: async (projectId: number): Promise<MiniProject & { tickets: Ticket[] }> => {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project details');
    }

    return response.json();
  },

  // Enroll student in project
  enrollInProject: async (
    studentId: number,
    projectId: number,
    repositoryUrl?: string
  ): Promise<StudentProjectEnrollment> => {
    const response = await fetch(`${API_URL}/project-enrollments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        studentId,
        projectId,
        repositoryUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to enroll in project');
    }

    return response.json();
  },

  // Get project tickets
  getProjectTickets: async (projectId: number): Promise<Ticket[]> => {
    const response = await fetch(`${API_URL}/projects/${projectId}/tickets`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch project tickets');
    }

    return response.json();
  },

  // Update student ticket progress
  updateTicketProgress: async (
    studentId: number,
    ticketId: number,
    data: {
      status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
      progress: number;
      notes?: string;
    }
  ): Promise<StudentTicketProgress> => {
    const response = await fetch(`${API_URL}/students/${studentId}/tickets/${ticketId}/progress`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update ticket progress');
    }

    return response.json();
  },

  // Get student's ticket progress
  getTicketProgress: async (studentId: number, ticketId: number): Promise<StudentTicketProgress> => {
    const response = await fetch(`${API_URL}/students/${studentId}/tickets/${ticketId}/progress`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch ticket progress');
    }

    return response.json();
  },

  // Update project enrollment
  updateProjectEnrollment: async (
    enrollmentId: number,
    data: {
      status?: 'active' | 'completed' | 'abandoned';
      progress?: number;
      repositoryUrl?: string;
    }
  ): Promise<StudentProjectEnrollment> => {
    const response = await fetch(`${API_URL}/project-enrollments/${enrollmentId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update project enrollment');
    }

    return response.json();
  },
};

export default projectService;
