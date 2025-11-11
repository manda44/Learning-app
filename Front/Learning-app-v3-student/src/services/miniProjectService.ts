import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

export interface TicketBasic {
  ticketId: number;
  miniProjectId: number;
  title: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MiniProjectBasic {
  miniProjectId: number;
  title: string;
  description: string;
  courseId: number;
  createdAt?: string;
  updatedAt?: string;
  tickets?: TicketBasic[];
}

export interface StudentTicketProgress {
  ticketProgressId: number;
  studentId: number;
  ticketId: number;
  startedDate?: string;
  completedDate?: string;
  status: string;
  progressPercentage: number;
  notes?: string;
  ticket?: TicketBasic;
}

export interface StudentProjectEnrollment {
  projectEnrollmentId: number;
  studentId: number;
  miniProjectId: number;
  enrollmentDate: string;
  status: string;
  progressPercentage: number;
  gitRepositoryUrl?: string;
  submissionDate?: string;
  submissionNotes?: string;
  miniProject?: MiniProjectBasic;
  ticketProgresses?: StudentTicketProgress[];
}

export const getStudentEnrollments = async (studentId: number): Promise<StudentProjectEnrollment[]> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/StudentProjectEnrollments/student/${studentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch enrollments');
  return response.json();
};

export const getStudentProjectEnrollment = async (studentId: number, projectId: number): Promise<StudentProjectEnrollment> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/StudentProjectEnrollments/student/${studentId}/project/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch enrollment');
  return response.json();
};

export const enrollInProject = async (studentId: number, miniProjectId: number): Promise<StudentProjectEnrollment> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/StudentProjectEnrollments/enroll`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ studentId, miniProjectId })
  });
  if (!response.ok) throw new Error('Failed to enroll');
  return response.json();
};

export const updateTicketProgress = async (
  ticketProgressId: number,
  status: string,
  notes?: string
): Promise<void> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/StudentProjectEnrollments/ticket-progress/${ticketProgressId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status, notes })
  });
  if (!response.ok) throw new Error('Failed to update progress');
};

export const updateGitRepository = async (
  enrollmentId: number,
  gitRepositoryUrl: string
): Promise<void> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/StudentProjectEnrollments/${enrollmentId}/git-repository`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ gitRepositoryUrl })
  });
  if (!response.ok) throw new Error('Failed to update git repository');
};

export const getMiniProjectsByCourse = async (courseId: number): Promise<MiniProjectBasic[]> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/MiniProjects/course/${courseId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch mini projects');
  return response.json();
};
