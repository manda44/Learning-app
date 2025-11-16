using LearningApp.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces
{
    public interface IChatService
    {
        // Chat Conversation Methods
        Task<ChatConversationDto> CreateConversationAsync(CreateChatConversationDto createDto);
        Task<ChatConversationDto> GetConversationAsync(int chatConversationId);
        Task<List<ChatConversationDto>> GetUserConversationsAsync(int userId);
        Task<List<ChatConversationDto>> GetCourseStudentConversationAsync(int courseId, int studentId);
        Task<List<ChatConversationDto>> GetCourseConversationsAsync(int courseId);
        Task<List<ChatConversationDto>> GetAllConversationsAsync();
        Task<ChatConversationDto> UpdateConversationAsync(int chatConversationId, UpdateChatConversationDto updateDto);
        Task<bool> DeleteConversationAsync(int chatConversationId);

        // Chat Message Methods
        Task<ChatMessageDto> SendMessageAsync(CreateChatMessageDto createDto);
        Task<ChatMessageDto> GetMessageAsync(int chatMessageId);
        Task<List<ChatMessageDto>> GetConversationMessagesAsync(int chatConversationId, int pageNumber = 1, int pageSize = 20);
        Task<ChatMessageDto> EditMessageAsync(int chatMessageId, UpdateChatMessageDto updateDto, int userId);
        Task<bool> DeleteMessageAsync(int chatMessageId, int userId);
        Task<bool> MarkConversationAsReadAsync(int chatConversationId, int userId);

        // Chat Attachment Methods
        Task<ChatMessageAttachmentDto> UploadAttachmentAsync(int chatMessageId, CreateChatMessageAttachmentDto createDto);
        Task<ChatMessageAttachmentDto> GetAttachmentAsync(int attachmentId);
        Task<bool> UpdateAttachmentUrlAsync(int attachmentId, string fileUrl, string thumbnailUrl);
        Task<List<ChatMessageAttachmentDto>> GetMessageAttachmentsAsync(int chatMessageId);
        Task<bool> DeleteAttachmentAsync(int attachmentId, int userId);

        // Participant Methods
        Task<ChatConversationParticipantDto> AddParticipantAsync(CreateChatConversationParticipantDto createDto);
        Task<List<ChatConversationParticipantDto>> GetConversationParticipantsAsync(int chatConversationId);
        Task<bool> RemoveParticipantAsync(int participantId);
        Task<ChatConversationParticipantDto> UpdateParticipantAsync(int participantId, UpdateChatConversationParticipantDto updateDto);
    }
}
