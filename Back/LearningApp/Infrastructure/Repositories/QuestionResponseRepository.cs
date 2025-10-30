using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class QuestionResponseRepository : Repository<QuestionResponse>, IQuestionResponseRepository
{
    public QuestionResponseRepository(ApplicationDbContext context) : base(context)
    {
    }
}
