using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LearningApp.Infrastructure.Repositories
{
    public class ChatMessageRepository : Repository<ChatMessage>, IChatMessageRepository
    {
        private readonly ApplicationDbContext _context;

        public ChatMessageRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<ChatMessage>> GetByChatConversationIdAsync(int chatConversationId, int pageNumber = 1, int pageSize = 20)
        {
            return await _context.ChatMessages
                .Where(m => m.ChatConversationId == chatConversationId && !m.IsDeleted)
                .Include(m => m.Attachments)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<ChatMessage>> GetByUserIdAsync(int userId, int pageNumber = 1, int pageSize = 20)
        {
            return await _context.ChatMessages
                .Where(m => m.SenderId == userId && !m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<ChatMessage> GetByIdWithAttachmentsAsync(int chatMessageId)
        {
            return await _context.ChatMessages
                .Include(m => m.Attachments)
                .FirstOrDefaultAsync(m => m.ChatMessageId == chatMessageId);
        }

        public async Task<int> GetMessageCountAsync(int chatConversationId)
        {
            return await _context.ChatMessages
                .Where(m => m.ChatConversationId == chatConversationId && !m.IsDeleted)
                .CountAsync();
        }

        public async Task SoftDeleteAsync(int chatMessageId)
        {
            var message = await _context.ChatMessages.FindAsync(chatMessageId);
            if (message != null)
            {
                message.IsDeleted = true;
                message.DeletedAt = System.DateTime.UtcNow;
                _context.ChatMessages.Update(message);
                await _context.SaveChangesAsync();
            }
        }
    }
}
