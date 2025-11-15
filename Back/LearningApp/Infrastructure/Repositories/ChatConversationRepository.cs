using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LearningApp.Infrastructure.Repositories
{
    public class ChatConversationRepository : Repository<ChatConversation>, IChatConversationRepository
    {
        private readonly ApplicationDbContext _context;

        public ChatConversationRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<ChatConversation> GetByIdWithMessagesAsync(int chatConversationId)
        {
            return await _context.ChatConversations
                .Include(c => c.Messages)
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.ChatConversationId == chatConversationId);
        }

        public async Task<List<ChatConversation>> GetByStudentIdAsync(int studentId)
        {
            return await _context.ChatConversations
                .Where(c => c.StudentId == studentId)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<ChatConversation>> GetByAdminIdAsync(int adminId)
        {
            return await _context.ChatConversations
                .Where(c => c.AdminId == adminId)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<ChatConversation>> GetByCourseAndStudentAsync(int courseId, int studentId)
        {
            return await _context.ChatConversations
                .Where(c => c.CourseId == courseId && c.StudentId == studentId)
                .Include(c => c.Messages)
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(int courseId, int studentId)
        {
            return await _context.ChatConversations
                .AnyAsync(c => c.CourseId == courseId && c.StudentId == studentId);
        }

        public async Task UpdateUnreadCountAsync(int chatConversationId, bool isStudent, int count)
        {
            var conversation = await _context.ChatConversations.FindAsync(chatConversationId);
            if (conversation != null)
            {
                if (isStudent)
                    conversation.UnreadStudentCount = count;
                else
                    conversation.UnreadAdminCount = count;

                _context.ChatConversations.Update(conversation);
                await _context.SaveChangesAsync();
            }
        }
    }
}
