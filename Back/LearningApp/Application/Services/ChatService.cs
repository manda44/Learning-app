using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LearningApp.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IRepository<ChatConversation> _conversationRepository;
        private readonly IRepository<ChatMessage> _messageRepository;
        private readonly IRepository<ChatMessageAttachment> _attachmentRepository;
        private readonly IRepository<ChatConversationParticipant> _participantRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notificationService;
        private readonly ILogger<ChatService> _logger;

        public ChatService(
            IRepository<ChatConversation> conversationRepository,
            IRepository<ChatMessage> messageRepository,
            IRepository<ChatMessageAttachment> attachmentRepository,
            IRepository<ChatConversationParticipant> participantRepository,
            IUserRepository userRepository,
            INotificationService notificationService,
            ILogger<ChatService> logger)
        {
            _conversationRepository = conversationRepository;
            _messageRepository = messageRepository;
            _attachmentRepository = attachmentRepository;
            _participantRepository = participantRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
            _logger = logger;
        }

        // Chat Conversation Methods
        public async Task<ChatConversationDto> CreateConversationAsync(CreateChatConversationDto createDto)
        {
            var conversation = new ChatConversation
            {
                CourseId = createDto.CourseId,
                StudentId = createDto.StudentId,
                Title = createDto.Title,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                UnreadStudentCount = 0,
                UnreadAdminCount = 0
            };

            await _conversationRepository.AddAsync(conversation);

            // Add student as participant
            var studentParticipant = new ChatConversationParticipant
            {
                ChatConversationId = conversation.ChatConversationId,
                UserId = createDto.StudentId,
                Role = "student",
                JoinedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _participantRepository.AddAsync(studentParticipant);

            return new ChatConversationDto
            {
                ChatConversationId = conversation.ChatConversationId,
                CourseId = conversation.CourseId,
                StudentId = conversation.StudentId,
                Title = conversation.Title,
                CreatedAt = conversation.CreatedAt,
                IsActive = conversation.IsActive
            };
        }

        public async Task<ChatConversationDto> GetConversationAsync(int chatConversationId)
        {
            var conversation = await _conversationRepository.GetByIdAsync(chatConversationId);
            if (conversation == null)
                throw new InvalidOperationException("Conversation not found");

            var student = await _userRepository.GetByIdAsync(conversation.StudentId);
            var admin = conversation.AdminId.HasValue ? await _userRepository.GetByIdAsync(conversation.AdminId.Value) : null;

            return new ChatConversationDto
            {
                ChatConversationId = conversation.ChatConversationId,
                CourseId = conversation.CourseId,
                StudentId = conversation.StudentId,
                AdminId = conversation.AdminId,
                Title = conversation.Title,
                CreatedAt = conversation.CreatedAt,
                ClosedAt = conversation.ClosedAt,
                IsActive = conversation.IsActive,
                UnreadStudentCount = conversation.UnreadStudentCount,
                UnreadAdminCount = conversation.UnreadAdminCount,
                LastMessageAt = conversation.LastMessageAt,
                StudentName = student?.FirstName + " " + student?.LastName,
                AdminName = admin?.FirstName + " " + admin?.LastName
            };
        }

        public async Task<List<ChatConversationDto>> GetUserConversationsAsync(int userId)
        {
            // Get all conversations where user is participant
            var dbContext = _conversationRepository.GetType();
            var conversations = await _conversationRepository.GetAllAsync();

            var userConversations = conversations
                .Where(c => c.StudentId == userId || c.AdminId == userId)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToList();

            var dtos = new List<ChatConversationDto>();
            foreach (var conv in userConversations)
            {
                dtos.Add(await GetConversationAsync(conv.ChatConversationId));
            }

            return dtos;
        }

        public async Task<List<ChatConversationDto>> GetCourseStudentConversationAsync(int courseId, int studentId)
        {
            var conversations = await _conversationRepository.GetAllAsync();
            var result = conversations
                .Where(c => c.CourseId == courseId && c.StudentId == studentId)
                .ToList();

            var dtos = new List<ChatConversationDto>();
            foreach (var conv in result)
            {
                dtos.Add(await GetConversationAsync(conv.ChatConversationId));
            }

            return dtos;
        }

        public async Task<ChatConversationDto> UpdateConversationAsync(int chatConversationId, UpdateChatConversationDto updateDto)
        {
            var conversation = await _conversationRepository.GetByIdAsync(chatConversationId);
            if (conversation == null)
                throw new InvalidOperationException("Conversation not found");

            conversation.Title = updateDto.Title ?? conversation.Title;
            conversation.IsActive = updateDto.IsActive;

            await _conversationRepository.UpdateAsync(conversation);
            return await GetConversationAsync(chatConversationId);
        }

        public async Task<bool> DeleteConversationAsync(int chatConversationId)
        {
            var conversation = await _conversationRepository.GetByIdAsync(chatConversationId);
            if (conversation == null)
                return false;

            await _conversationRepository.DeleteAsync(chatConversationId);
            return true;
        }

        public async Task<List<ChatConversationDto>> GetCourseConversationsAsync(int courseId)
        {
            var conversations = await _conversationRepository.GetAllAsync();
            var result = conversations
                .Where(c => c.CourseId == courseId)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToList();

            var dtos = new List<ChatConversationDto>();
            foreach (var conv in result)
            {
                dtos.Add(await GetConversationAsync(conv.ChatConversationId));
            }

            return dtos;
        }

        public async Task<List<ChatConversationDto>> GetAllConversationsAsync()
        {
            var conversations = await _conversationRepository.GetAllAsync();
            var result = conversations
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToList();

            var dtos = new List<ChatConversationDto>();
            foreach (var conv in result)
            {
                dtos.Add(await GetConversationAsync(conv.ChatConversationId));
            }

            return dtos;
        }

        // Chat Message Methods
        public async Task<ChatMessageDto> SendMessageAsync(CreateChatMessageDto createDto)
        {
            var conversation = await _conversationRepository.GetByIdAsync(createDto.ChatConversationId);
            if (conversation == null)
                throw new InvalidOperationException("Conversation not found");

            var message = new ChatMessage
            {
                ChatConversationId = createDto.ChatConversationId,
                SenderId = createDto.SenderId,
                Content = createDto.Content,
                CreatedAt = DateTime.UtcNow,
                IsEdited = false,
                IsDeleted = false
            };

            await _messageRepository.AddAsync(message);

            // Update conversation's last message time
            conversation.LastMessageAt = DateTime.UtcNow;

            var sender = await _userRepository.GetByIdAsync(createDto.SenderId);
            var isAdminSender = await IsUserAdminAsync(createDto.SenderId);

            // Increment unread count based on who sent the message
            if (createDto.SenderId == conversation.StudentId)
            {
                // Student sent the message, admin has unread messages
                conversation.UnreadAdminCount++;
            }
            else
            {
                // Admin/Non-student sent the message, student has unread messages
                conversation.UnreadStudentCount++;
            }

            await _conversationRepository.UpdateAsync(conversation);

            // Create notification for the other party
            try
            {
                if (isAdminSender)
                {
                    // Admin is sending a message to student - notify student
                    var senderDisplayName = $"{sender?.FirstName} {sender?.LastName}".Trim();
                    await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                    {
                        UserId = conversation.StudentId,
                        Type = "Message",
                        Title = "Nouveau message",
                        Message = $"{senderDisplayName} a répondu à votre message.",
                        RelatedEntityId = conversation.ChatConversationId,
                        RelatedEntityType = "ChatConversation"
                    });
                }
                else if (createDto.SenderId == conversation.StudentId)
                {
                    // Student is sending a message to admin - notify all admins
                    // Get all users with admin role
                    var allUsers = await _userRepository.GetAllAsync();
                    var adminUsers = new List<Users>();

                    foreach (var user in allUsers)
                    {
                        if (await IsUserAdminAsync(user.UserId))
                        {
                            adminUsers.Add(user);
                        }
                    }

                    // Create notification for each admin
                    var studentDisplayName = $"{sender?.FirstName} {sender?.LastName}".Trim();
                    foreach (var admin in adminUsers)
                    {
                        try
                        {
                            await _notificationService.CreateNotificationAsync(new CreateNotificationDto
                            {
                                UserId = admin.UserId,
                                Type = "Message",
                                Title = "Nouveau message d'un étudiant",
                                Message = $"{studentDisplayName} a envoyé un message.",
                                RelatedEntityId = conversation.ChatConversationId,
                                RelatedEntityType = "ChatConversation"
                            });
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning($"Error creating notification for admin {admin.UserId}: {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Error creating notification: {ex.Message}");
                // Don't fail the message sending if notification fails
            }

            return new ChatMessageDto
            {
                ChatMessageId = message.ChatMessageId,
                ChatConversationId = message.ChatConversationId,
                SenderId = message.SenderId,
                Content = message.Content,
                CreatedAt = message.CreatedAt,
                IsEdited = message.IsEdited,
                SenderName = sender?.FirstName + " " + sender?.LastName,
                SenderEmail = sender?.Email
            };
        }

        /// <summary>
        /// Check if a user has admin or teacher role
        /// </summary>
        private async Task<bool> IsUserAdminAsync(int userId)
        {
            try
            {
                var user = await _userRepository.GetByIdWithRolesAsync(userId);
                if (user?.UserRoles == null || user.UserRoles.Count == 0)
                    return false;

                return user.UserRoles.Any(ur =>
                    ur.Role != null &&
                    (ur.Role.Name.ToLower() == "admin" || ur.Role.Name.ToLower() == "teacher"));
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error checking admin status for user {userId}: {ex.Message}");
                return false;
            }
        }

        public async Task<ChatMessageDto> GetMessageAsync(int chatMessageId)
        {
            var message = await _messageRepository.GetByIdAsync(chatMessageId);
            if (message == null)
                throw new InvalidOperationException("Message not found");

            var sender = await _userRepository.GetByIdAsync(message.SenderId);
            var attachments = await _attachmentRepository.GetAllAsync();
            var messageAttachments = attachments
                .Where(a => a.ChatMessageId == chatMessageId)
                .ToList();

            return new ChatMessageDto
            {
                ChatMessageId = message.ChatMessageId,
                ChatConversationId = message.ChatConversationId,
                SenderId = message.SenderId,
                Content = message.Content,
                CreatedAt = message.CreatedAt,
                IsEdited = message.IsEdited,
                EditedAt = message.EditedAt,
                IsDeleted = message.IsDeleted,
                SenderName = sender?.FirstName + " " + sender?.LastName,
                SenderEmail = sender?.Email,
                Attachments = messageAttachments.Select(a => new ChatMessageAttachmentDto
                {
                    ChatMessageAttachmentId = a.ChatMessageAttachmentId,
                    ChatMessageId = a.ChatMessageId,
                    FileType = a.FileType,
                    OriginalFileName = a.OriginalFileName,
                    StoredFileName = a.StoredFileName,
                    FileUrl = a.FileUrl,
                    FileSizeBytes = a.FileSizeBytes,
                    MimeType = a.MimeType,
                    ImageWidth = a.ImageWidth,
                    ImageHeight = a.ImageHeight,
                    ThumbnailUrl = a.ThumbnailUrl,
                    UploadedAt = a.UploadedAt
                }).ToList()
            };
        }

        public async Task<List<ChatMessageDto>> GetConversationMessagesAsync(int chatConversationId, int pageNumber = 1, int pageSize = 20)
        {
            var messages = await _messageRepository.GetAllAsync();
            var conversationMessages = messages
                .Where(m => m.ChatConversationId == chatConversationId && !m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var dtos = new List<ChatMessageDto>();
            foreach (var msg in conversationMessages)
            {
                dtos.Add(await GetMessageAsync(msg.ChatMessageId));
            }

            return dtos;
        }

        public async Task<ChatMessageDto> EditMessageAsync(int chatMessageId, UpdateChatMessageDto updateDto, int userId)
        {
            var message = await _messageRepository.GetByIdAsync(chatMessageId);
            if (message == null)
                throw new InvalidOperationException("Message not found");

            if (message.SenderId != userId)
                throw new UnauthorizedAccessException("You can only edit your own messages");

            message.Content = updateDto.Content;
            message.IsEdited = true;
            message.EditedAt = DateTime.UtcNow;

            await _messageRepository.UpdateAsync(message);
            return await GetMessageAsync(chatMessageId);
        }

        public async Task<bool> DeleteMessageAsync(int chatMessageId, int userId)
        {
            var message = await _messageRepository.GetByIdAsync(chatMessageId);
            if (message == null)
                return false;

            if (message.SenderId != userId)
                throw new UnauthorizedAccessException("You can only delete your own messages");

            message.IsDeleted = true;
            message.DeletedAt = DateTime.UtcNow;

            await _messageRepository.UpdateAsync(message);
            return true;
        }

        public async Task<bool> MarkConversationAsReadAsync(int chatConversationId, int userId)
        {
            var conversation = await _conversationRepository.GetByIdAsync(chatConversationId);
            if (conversation == null)
                return false;

            // Update unread count based on user role
            if (conversation.StudentId == userId)
            {
                conversation.UnreadStudentCount = 0;
            }
            else if (conversation.AdminId == userId || conversation.AdminId == null)
            {
                // Admin or any non-student user marks as read
                conversation.UnreadAdminCount = 0;
            }

            await _conversationRepository.UpdateAsync(conversation);

            // Update participant's last read time
            var participants = await _participantRepository.GetAllAsync();
            var participant = participants.FirstOrDefault(p => p.ChatConversationId == chatConversationId && p.UserId == userId);
            if (participant != null)
            {
                participant.LastReadAt = DateTime.UtcNow;
                await _participantRepository.UpdateAsync(participant);
            }

            return true;
        }

        // Chat Attachment Methods
        public async Task<ChatMessageAttachmentDto> UploadAttachmentAsync(int chatMessageId, CreateChatMessageAttachmentDto createDto)
        {
            var message = await _messageRepository.GetByIdAsync(chatMessageId);
            if (message == null)
                throw new InvalidOperationException("Message not found");

            var attachment = new ChatMessageAttachment
            {
                ChatMessageId = chatMessageId,
                FileType = createDto.FileType,
                OriginalFileName = createDto.OriginalFileName,
                StoredFileName = createDto.StoredFileName,
                FileSizeBytes = createDto.FileSizeBytes,
                MimeType = createDto.MimeType,
                ImageWidth = createDto.ImageWidth,
                ImageHeight = createDto.ImageHeight,
                FileUrl = createDto.FileUrl,
                ThumbnailUrl = createDto.ThumbnailUrl,
                UploadedAt = DateTime.UtcNow
            };

            await _attachmentRepository.AddAsync(attachment);

            return new ChatMessageAttachmentDto
            {
                ChatMessageAttachmentId = attachment.ChatMessageAttachmentId,
                ChatMessageId = attachment.ChatMessageId,
                FileType = attachment.FileType,
                OriginalFileName = attachment.OriginalFileName,
                StoredFileName = attachment.StoredFileName,
                FileSizeBytes = attachment.FileSizeBytes,
                MimeType = attachment.MimeType,
                ImageWidth = attachment.ImageWidth,
                ImageHeight = attachment.ImageHeight,
                FileUrl = attachment.FileUrl,
                ThumbnailUrl = attachment.ThumbnailUrl,
                UploadedAt = attachment.UploadedAt
            };
        }

        public async Task<ChatMessageAttachmentDto> GetAttachmentAsync(int attachmentId)
        {
            var attachment = await _attachmentRepository.GetByIdAsync(attachmentId);
            if (attachment == null)
                return null;

            return new ChatMessageAttachmentDto
            {
                ChatMessageAttachmentId = attachment.ChatMessageAttachmentId,
                ChatMessageId = attachment.ChatMessageId,
                FileType = attachment.FileType,
                OriginalFileName = attachment.OriginalFileName,
                StoredFileName = attachment.StoredFileName,
                FileUrl = attachment.FileUrl,
                FileSizeBytes = attachment.FileSizeBytes,
                MimeType = attachment.MimeType,
                ImageWidth = attachment.ImageWidth,
                ImageHeight = attachment.ImageHeight,
                ThumbnailUrl = attachment.ThumbnailUrl,
                UploadedAt = attachment.UploadedAt
            };
        }

        public async Task<bool> UpdateAttachmentUrlAsync(int attachmentId, string fileUrl, string thumbnailUrl)
        {
            var attachment = await _attachmentRepository.GetByIdAsync(attachmentId);
            if (attachment == null)
                return false;

            attachment.FileUrl = fileUrl;
            attachment.ThumbnailUrl = thumbnailUrl;

            await _attachmentRepository.UpdateAsync(attachment);
            return true;
        }

        public async Task<List<ChatMessageAttachmentDto>> GetMessageAttachmentsAsync(int chatMessageId)
        {
            var message = await _messageRepository.GetByIdAsync(chatMessageId);
            if (message == null)
                throw new InvalidOperationException("Message not found");

            var attachments = await _attachmentRepository.GetAllAsync();
            var messageAttachments = attachments
                .Where(a => a.ChatMessageId == chatMessageId)
                .ToList();

            return messageAttachments.Select(a => new ChatMessageAttachmentDto
            {
                ChatMessageAttachmentId = a.ChatMessageAttachmentId,
                ChatMessageId = a.ChatMessageId,
                FileType = a.FileType,
                OriginalFileName = a.OriginalFileName,
                StoredFileName = a.StoredFileName,
                FileUrl = a.FileUrl,
                FileSizeBytes = a.FileSizeBytes,
                MimeType = a.MimeType,
                ImageWidth = a.ImageWidth,
                ImageHeight = a.ImageHeight,
                ThumbnailUrl = a.ThumbnailUrl,
                UploadedAt = a.UploadedAt
            }).ToList();
        }

        public async Task<bool> DeleteAttachmentAsync(int attachmentId, int userId)
        {
            var attachment = await _attachmentRepository.GetByIdAsync(attachmentId);
            if (attachment == null)
                return false;

            var message = await _messageRepository.GetByIdAsync(attachment.ChatMessageId);
            if (message.SenderId != userId)
                throw new UnauthorizedAccessException("You can only delete your own attachments");

            await _attachmentRepository.DeleteAsync(attachmentId);
            return true;
        }

        // Participant Methods
        public async Task<ChatConversationParticipantDto> AddParticipantAsync(CreateChatConversationParticipantDto createDto)
        {
            var conversation = await _conversationRepository.GetByIdAsync(createDto.ChatConversationId);
            if (conversation == null)
                throw new InvalidOperationException("Conversation not found");

            var participant = new ChatConversationParticipant
            {
                ChatConversationId = createDto.ChatConversationId,
                UserId = createDto.UserId,
                Role = createDto.Role,
                JoinedAt = DateTime.UtcNow,
                IsActive = true
            };

            await _participantRepository.AddAsync(participant);

            var user = await _userRepository.GetByIdAsync(createDto.UserId);

            return new ChatConversationParticipantDto
            {
                ChatConversationParticipantId = participant.ChatConversationParticipantId,
                ChatConversationId = participant.ChatConversationId,
                UserId = participant.UserId,
                Role = participant.Role,
                JoinedAt = participant.JoinedAt,
                IsActive = participant.IsActive,
                UserName = user?.FirstName + " " + user?.LastName,
                UserEmail = user?.Email
            };
        }

        public async Task<List<ChatConversationParticipantDto>> GetConversationParticipantsAsync(int chatConversationId)
        {
            var participants = await _participantRepository.GetAllAsync();
            var conversationParticipants = participants
                .Where(p => p.ChatConversationId == chatConversationId && p.IsActive)
                .ToList();

            var dtos = new List<ChatConversationParticipantDto>();
            foreach (var participant in conversationParticipants)
            {
                var user = await _userRepository.GetByIdAsync(participant.UserId);
                dtos.Add(new ChatConversationParticipantDto
                {
                    ChatConversationParticipantId = participant.ChatConversationParticipantId,
                    ChatConversationId = participant.ChatConversationId,
                    UserId = participant.UserId,
                    Role = participant.Role,
                    JoinedAt = participant.JoinedAt,
                    LeftAt = participant.LeftAt,
                    LastReadAt = participant.LastReadAt,
                    IsActive = participant.IsActive,
                    UserName = user?.FirstName + " " + user?.LastName,
                    UserEmail = user?.Email
                });
            }

            return dtos;
        }

        public async Task<bool> RemoveParticipantAsync(int participantId)
        {
            var participant = await _participantRepository.GetByIdAsync(participantId);
            if (participant == null)
                return false;

            participant.IsActive = false;
            participant.LeftAt = DateTime.UtcNow;

            await _participantRepository.UpdateAsync(participant);
            return true;
        }

        public async Task<ChatConversationParticipantDto> UpdateParticipantAsync(int participantId, UpdateChatConversationParticipantDto updateDto)
        {
            var participant = await _participantRepository.GetByIdAsync(participantId);
            if (participant == null)
                throw new InvalidOperationException("Participant not found");

            if (updateDto.LastReadAt.HasValue)
                participant.LastReadAt = updateDto.LastReadAt;

            if (updateDto.IsActive.HasValue)
                participant.IsActive = updateDto.IsActive.Value;

            await _participantRepository.UpdateAsync(participant);

            var user = await _userRepository.GetByIdAsync(participant.UserId);

            return new ChatConversationParticipantDto
            {
                ChatConversationParticipantId = participant.ChatConversationParticipantId,
                ChatConversationId = participant.ChatConversationId,
                UserId = participant.UserId,
                Role = participant.Role,
                JoinedAt = participant.JoinedAt,
                LeftAt = participant.LeftAt,
                LastReadAt = participant.LastReadAt,
                IsActive = participant.IsActive,
                UserName = user?.FirstName + " " + user?.LastName,
                UserEmail = user?.Email
            };
        }
    }
}
