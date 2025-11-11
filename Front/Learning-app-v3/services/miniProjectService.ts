import apiClient from './apiClient';
import type { MiniProject, Ticket } from '../types/MiniProject';

const API_BASE_URL = '/miniprojects';
const TICKETS_API_URL = '/tickets';

// Mini Projects endpoints
export const getMiniProjectList = async (): Promise<MiniProject[]> => {
  const response = await apiClient.get<MiniProject[]>(API_BASE_URL);
  return response.data;
};

export const getMiniProjectById = async (id: number): Promise<MiniProject> => {
  const response = await apiClient.get<MiniProject>(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const createMiniProject = async (miniProject: Omit<MiniProject, 'miniProjectId'>): Promise<MiniProject> => {
  const response = await apiClient.post<MiniProject>(API_BASE_URL, miniProject);
  return response.data;
};

export const updateMiniProject = async (id: number, miniProject: Partial<MiniProject>): Promise<void> => {
  await apiClient.put(`${API_BASE_URL}/${id}`, miniProject);
};

export const deleteMiniProject = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_BASE_URL}/${id}`);
};

export const getMiniProjectTickets = async (miniProjectId: number): Promise<Ticket[]> => {
  const response = await apiClient.get<Ticket[]>(`${API_BASE_URL}/${miniProjectId}/tickets`);
  return response.data;
};

// Tickets endpoints
export const getTicketList = async (): Promise<Ticket[]> => {
  const response = await apiClient.get<Ticket[]>(TICKETS_API_URL);
  return response.data;
};

export const getTicketById = async (id: number): Promise<Ticket> => {
  const response = await apiClient.get<Ticket>(`${TICKETS_API_URL}/${id}`);
  return response.data;
};

export const createTicket = async (ticket: Omit<Ticket, 'ticketId'>): Promise<Ticket> => {
  const response = await apiClient.post<Ticket>(TICKETS_API_URL, ticket);
  return response.data;
};

export const updateTicket = async (id: number, ticket: Partial<Ticket>): Promise<void> => {
  await apiClient.put(`${TICKETS_API_URL}/${id}`, ticket);
};

export const deleteTicket = async (id: number): Promise<void> => {
  await apiClient.delete(`${TICKETS_API_URL}/${id}`);
};

// Ticket Validation endpoints
export interface PendingValidationTicket {
  ticketProgressId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  ticketId: number;
  ticketTitle: string;
  ticketDescription?: string;
  miniProjectId: number;
  miniProjectTitle: string;
  courseId: number;
  courseName: string;
  completedDate?: string;
  notes?: string;
}

export const getPendingValidationTickets = async (): Promise<PendingValidationTicket[]> => {
  const response = await apiClient.get<PendingValidationTicket[]>(`${TICKETS_API_URL}/pending-validation`);
  return response.data;
};

export const getPendingValidationTicketsByCourse = async (courseId: number): Promise<PendingValidationTicket[]> => {
  const response = await apiClient.get<PendingValidationTicket[]>(`${TICKETS_API_URL}/pending-validation/course/${courseId}`);
  return response.data;
};

export const validateTicket = async (ticketProgressId: number): Promise<void> => {
  await apiClient.put(`${TICKETS_API_URL}/${ticketProgressId}/validate`, {});
};
