import axios from 'axios';
import { getAuthorizationHeader } from '../../services/authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7121/api';

export interface ChatConversationAdmin {
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

export interface ChatMessageAdmin {
  chatMessageId: number;
  chatConversationId: number;
  senderId: number;
  senderName: string;
  senderType: 'student' | 'admin';
  content: string;
  createdAt: string;
  isDeleted: boolean;
  attachments?: ChatAttachment[];
}

class ChatAdminService {
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

  // Get all conversations for a specific course
  async getCourseConversations(courseId: number): Promise<ChatConversationAdmin[]> {
    const response = await this.api.get<ChatConversationAdmin[]>(
      `/ChatConversation/course/${courseId}/all`
    );
    return response.data;
  }

  // Get all conversations (for all courses)
  async getAllConversations(): Promise<ChatConversationAdmin[]> {
    const response = await this.api.get<ChatConversationAdmin[]>(
      `/ChatConversation/all`
    );
    return response.data;
  }

  // Get messages for a specific conversation
  async getConversationMessages(
    conversationId: number,
    pageNumber: number = 1,
    pageSize: number = 50
  ): Promise<ChatMessageAdmin[]> {
    const response = await this.api.get<ChatMessageAdmin[]>(
      `/ChatMessage/conversation/${conversationId}`,
      {
        params: { pageNumber, pageSize },
      }
    );
    return response.data;
  }

  // Send reply message from admin
  async sendAdminMessage(
    conversationId: number,
    adminId: number,
    content: string
  ): Promise<ChatMessageAdmin> {
    const response = await this.api.post<ChatMessageAdmin>('/ChatMessage/send', {
      chatConversationId: conversationId,
      senderId: adminId,
      content,
    });
    return response.data;
  }

  // Get a specific message
  async getMessage(messageId: number): Promise<ChatMessageAdmin> {
    const response = await this.api.get<ChatMessageAdmin>(`/ChatMessage/${messageId}`);
    return response.data;
  }

  // Upload attachment to a message
  async uploadAttachment(messageId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<any>(
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

  // Mark conversation as read by admin
  async markConversationAsReadByAdmin(
    conversationId: number,
    adminId: number
  ): Promise<void> {
    await this.api.post(`/ChatConversation/${conversationId}/mark-as-read`, {
      userId: adminId,
    });
  }

  // Close/delete conversation
  async closeConversation(conversationId: number): Promise<void> {
    await this.api.delete(`/ChatConversation/${conversationId}`);
  }
}

export default new ChatAdminService();
