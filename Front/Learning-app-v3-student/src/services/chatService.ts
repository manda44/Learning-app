import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

export interface ChatMessage {
  chatMessageId: number;
  chatConversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  isDeleted: boolean;
  attachments?: ChatAttachment[];
}

export interface ChatAttachment {
  chatMessageAttachmentId: number;
  chatMessageId: number;
  originalFileName: string;
  storedFileName: string;
  fileUrl: string;
  fileType: string;
  mimeType: string;
  fileSizeBytes: number;
  imageWidth?: number;
  imageHeight?: number;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface ChatConversation {
  chatConversationId: number;
  courseId: number;
  studentId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  unreadStudentCount?: number;
  unreadAdminCount?: number;
}

export interface CreateChatMessageDto {
  chatConversationId: number;
  senderId: number;
  content: string;
}

export interface CreateChatConversationDto {
  courseId: number;
  studentId: number;
  title: string;
}

class ChatService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add interceptor to include token in all requests
    this.api.interceptors.request.use((config) => {
      const token = authService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Create a new conversation
  async createConversation(data: CreateChatConversationDto): Promise<ChatConversation> {
    const response = await this.api.post<ChatConversation>('/ChatConversation/create', data);
    return response.data;
  }

  // Get conversation by course and student
  async getConversationByCourseStudent(courseId: number, studentId: number): Promise<ChatConversation[]> {
    const response = await this.api.get<ChatConversation[]>(
      `/ChatConversation/course/${courseId}/student/${studentId}`
    );
    return response.data;
  }

  // Get messages in a conversation
  async getConversationMessages(
    conversationId: number,
    pageNumber: number = 1,
    pageSize: number = 50
  ): Promise<ChatMessage[]> {
    const response = await this.api.get<ChatMessage[]>(
      `/ChatMessage/conversation/${conversationId}`,
      {
        params: { pageNumber, pageSize },
      }
    );
    return response.data;
  }

  // Send a message
  async sendMessage(data: CreateChatMessageDto): Promise<ChatMessage> {
    const response = await this.api.post<ChatMessage>('/ChatMessage/send', data);
    return response.data;
  }

  // Get a specific message
  async getMessage(messageId: number): Promise<ChatMessage> {
    const response = await this.api.get<ChatMessage>(`/ChatMessage/${messageId}`);
    return response.data;
  }

  // Upload attachment to a message
  async uploadAttachment(messageId: number, file: File): Promise<ChatAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<ChatAttachment>(
      `/ChatAttachment/upload`,
      formData,
      {
        params: { chatMessageId: messageId },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Delete a message
  async deleteMessage(messageId: number, userId: number): Promise<void> {
    await this.api.delete(`/ChatMessage/${messageId}`, {
      params: { userId },
    });
  }

  // Mark conversation as read
  async markConversationAsRead(
    conversationId: number,
    data: { userId: number }
  ): Promise<void> {
    await this.api.post(`/ChatConversation/${conversationId}/mark-as-read`, data);
  }
}

export default new ChatService();
