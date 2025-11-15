using LearningApp.Domain;
using LearningApp.Infrastructure.Data;

namespace LearningApp.Infrastructure.Repositories
{
    public class ChatConversationParticipantRepository : Repository<ChatConversationParticipant>
    {
        private readonly ApplicationDbContext _context;

        public ChatConversationParticipantRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
