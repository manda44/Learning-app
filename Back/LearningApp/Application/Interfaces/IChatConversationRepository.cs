using LearningApp.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Application.Interfaces
{
    public interface IChatConversationRepository : IRepository<ChatConversation>
    {
        Task<ChatConversation> GetByIdWithMessagesAsync(int chatConversationId);
        Task<List<ChatConversation>> GetByStudentIdAsync(int studentId);
        Task<List<ChatConversation>> GetByAdminIdAsync(int adminId);
        Task<List<ChatConversation>> GetByCourseAndStudentAsync(int courseId, int studentId);
        Task<bool> ExistsAsync(int courseId, int studentId);
        Task UpdateUnreadCountAsync(int chatConversationId, bool isStudent, int count);
    }
}
