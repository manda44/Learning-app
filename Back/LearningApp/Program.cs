using LearningApp.Application.Interfaces;
using LearningApp.Application.Services;
using LearningApp.Application.Settings;
using LearningApp.Controllers;
using LearningApp.Infrastructure.Data;
using LearningApp.Infrastructure.Middlewares;
using LearningApp.Infrastructure.Repositories;
using LearningApp.Domain;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NLog.Web;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configuration JWT
var jwtSettings = new JwtSettings();
builder.Configuration.GetSection("JwtSettings").Bind(jwtSettings);
builder.Services.AddSingleton(jwtSettings);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                 .AllowAnyHeader()
                 .AllowAnyMethod();
        });
});

// Configuration Authentication JWT
var key = Encoding.ASCII.GetBytes(jwtSettings.SecretKey ?? throw new InvalidOperationException("JWT Secret Key is not configured"));
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Add services to the container.

builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        // Ignore les boucles de référence
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        // Optionnel : conserve la structure des objets référencés
        options.SerializerSettings.PreserveReferencesHandling = Newtonsoft.Json.PreserveReferencesHandling.Objects;
    });

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IUserRoleRepository, UserRoleRepository>();
builder.Services.AddScoped<IChapterRepository, ChapterRepository>();
builder.Services.AddScoped<IChapterContentRepository, ContentRepository>();
builder.Services.AddScoped<IQuizRepository, QuizRepository>();
builder.Services.AddScoped<IQuestionRepository, QuestionRepository>();
builder.Services.AddScoped<IQuestionItemRepository, QuestionItemRepository>();

// Student enrollment and progress repositories
builder.Services.AddScoped<IStudentCourseEnrollmentRepository, StudentCourseEnrollmentRepository>();
builder.Services.AddScoped<IStudentChapterProgressRepository, StudentChapterProgressRepository>();
builder.Services.AddScoped<IStudentQuizAttemptRepository, StudentQuizAttemptRepository>();
builder.Services.AddScoped<IStudentProjectEnrollmentRepository, StudentProjectEnrollmentRepository>();
builder.Services.AddScoped<IStudentTicketProgressRepository, StudentTicketProgressRepository>();
builder.Services.AddScoped<IStudentAchievementRepository, StudentAchievementRepository>();
builder.Services.AddScoped<IStudentActivityRepository, StudentActivityRepository>();
builder.Services.AddScoped<ICourseMiniProjectRepository, CourseMiniProjectRepository>();

builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<RoleService>();
builder.Services.AddScoped<UserRoleService>();
builder.Services.AddScoped<ChapterService>();
builder.Services.AddScoped<ChapterContentService>();
builder.Services.AddScoped<QuizService>();
builder.Services.AddScoped<AuthService>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Logging.ClearProviders();
builder.Host.UseNLog();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Ajouter l'authentification AVANT authorization
app.UseAuthentication();
app.UseAuthorization();

app.UseCors("AllowAll");

app.UseMiddleware<ExceptionLoggingMiddleware>();

app.MapControllers();

app.Run();
