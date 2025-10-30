using LearningApp.Application.Interfaces;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.Infrastructure.Repositories;

public class QuizResponseRepository : Repository<QuizResponse>,IQuizResponseRepository
{
    public QuizResponseRepository(ApplicationDbContext context) : base(context)
    {
    }
}
