using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class QuestionItemRepository : Repository<QuestionItem>, IQuestionItemRepository
{
    public QuestionItemRepository(ApplicationDbContext context) : base(context)
    {
    }
}
