using LearningApp.Domain;
using LearningApp.Infrastructure.Data;

namespace LearningApp.Infrastructure.Repositories
{
    public class ChatMessageAttachmentRepository : Repository<ChatMessageAttachment>
    {
        private readonly ApplicationDbContext _context;

        public ChatMessageAttachmentRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
