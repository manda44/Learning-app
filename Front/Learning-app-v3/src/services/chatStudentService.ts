import axios from 'axios';
import { getAuthorizationHeader } from '../../services/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

export interface ChatConversationStudent {
  chatConversationId: number;
  courseId: number;
  studentId: number;
  title: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  unreadStudentCount: number;
  unreadAdminCount: number;
  lastMessageAt?: string;
  studentName?: string;
  adminName?: string;
  courseName?: string;
}

export interface ChatMessageStudent {
  chatMessageId: number;
  chatConversationId: number;
  senderId: number;
  senderName: string;
  senderType: 'student' | 'admin';
  content: string;
  createdAt: string;
  isDeleted: boolean;
  attachments?: Array<{
    chatMessageAttachmentId: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
  }>;
}

class ChatStudentService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add interceptor to include token in all requests
    this.api.interceptors.request.use((config) => {
      const authHeader = getAuthorizationHeader();
      if (authHeader) {
        config.headers.Authorization = authHeader;
      }
      return config;
    });
  }

  // Get all conversations for the current student
  async getStudentConversations(studentId: number): Promise<ChatConversationStudent[]> {
    const response = await this.api.get<ChatConversationStudent[]>(
      `/ChatConversation/user/${studentId}`
    );
    return response.data;
  }

  // Get messages for a specific conversation
  async getConversationMessages(
    conversationId: number,
    pageNumber: number = 1,
    pageSize: number = 50
  ): Promise<ChatMessageStudent[]> {
    const response = await this.api.get<ChatMessageStudent[]>(
      `/ChatMessage/conversation/${conversationId}`,
      {
        params: { pageNumber, pageSize },
      }
    );
    return response.data;
  }

  // Send reply message from student
  async sendStudentMessage(
    conversationId: number,
    studentId: number,
    content: string
  ): Promise<ChatMessageStudent> {
    const response = await this.api.post<ChatMessageStudent>('/ChatMessage/send', {
      chatConversationId: conversationId,
      senderId: studentId,
      content,
    });
    return response.data;
  }

  // Mark conversation as read by student
  async markConversationAsReadByStudent(
    conversationId: number,
    studentId: number
  ): Promise<void> {
    await this.api.post(`/ChatConversation/${conversationId}/mark-as-read`, {
      userId: studentId,
    });
  }

  // Close/delete conversation
  async closeConversation(conversationId: number): Promise<void> {
    await this.api.delete(`/ChatConversation/${conversationId}`);
  }
}

export default new ChatStudentService();
