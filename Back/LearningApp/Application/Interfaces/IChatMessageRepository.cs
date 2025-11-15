using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces
{
    public interface IChatMessageRepository : IRepository<ChatMessage>
    {
        Task<List<ChatMessage>> GetByChatConversationIdAsync(int chatConversationId, int pageNumber = 1, int pageSize = 20);
        Task<List<ChatMessage>> GetByUserIdAsync(int userId, int pageNumber = 1, int pageSize = 20);
        Task<ChatMessage> GetByIdWithAttachmentsAsync(int chatMessageId);
        Task<int> GetMessageCountAsync(int chatConversationId);
        Task SoftDeleteAsync(int chatMessageId);
    }
}
