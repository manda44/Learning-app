﻿using LearningApp.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace LearningApp.Infrastructure.Data;

public partial class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Chapter> Chapters { get; set; }

    public virtual DbSet<ConnexionHistory> ConnexionHistories { get; set; }

    public virtual DbSet<Content> Contents { get; set; }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<MiniProject> MiniProjects { get; set; }

    public virtual DbSet<Question> Questions { get; set; }

    public virtual DbSet<QuestionItem> QuestionItems { get; set; }

    public virtual DbSet<QuestionResponse> QuestionResponses { get; set; }

    public virtual DbSet<Quiz> Quizzes { get; set; }

    public virtual DbSet<QuizResponse> QuizResponses { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Ticket> Tickets { get; set; }

    public virtual DbSet<Users> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    // Student enrollment and progress tables
    public virtual DbSet<StudentCourseEnrollment> StudentCourseEnrollments { get; set; }

    public virtual DbSet<StudentChapterProgress> StudentChapterProgresses { get; set; }

    public virtual DbSet<StudentQuizAttempt> StudentQuizAttempts { get; set; }

    public virtual DbSet<StudentQuestionResponse> StudentQuestionResponses { get; set; }

    public virtual DbSet<StudentProjectEnrollment> StudentProjectEnrollments { get; set; }

    public virtual DbSet<StudentTicketProgress> StudentTicketProgresses { get; set; }

    public virtual DbSet<StudentAchievement> StudentAchievements { get; set; }

    public virtual DbSet<StudentActivity> StudentActivities { get; set; }

    public virtual DbSet<CourseMiniProject> CourseMiniProjects { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Chapter>(entity =>
        {
            entity.HasKey(e => e.ChapterId).HasName("PK__Chapter__0893A36A2E6D1655");

            entity.ToTable("Chapter");

            entity.HasIndex(e => e.CourseId, "IX_Chapter_CourseId");

            entity.Property(e => e.Color)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("");
            entity.Property(e => e.Description).IsUnicode(false);
            entity.Property(e => e.Order_).HasColumnName("Order_");
            entity.Property(e => e.Title)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.Course).WithMany(p => p.Chapters)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Chapter__CourseI__412EB0B6");
        });

        modelBuilder.Entity<ConnexionHistory>(entity =>
        {
            entity.HasKey(e => e.ConnexionHistoryId).HasName("PK__Connexio__34F640042DF6E257");

            entity.ToTable("ConnexionHistory");

            entity.HasIndex(e => e.UserId, "IX_ConnexionHistory_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.ConnexionHistories)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Connexion__UserI__3E52440B");
        });

        modelBuilder.Entity<Content>(entity =>
        {
            entity.HasKey(e => e.ContentId).HasName("PK__Content__2907A81EFEFA15CE");

            entity.ToTable("Content");

            entity.HasIndex(e => e.ChapterId, "IX_Content_ChapterId");

            entity.Property(e => e.Data).IsUnicode(false);
            entity.Property(e => e.Order).HasColumnName("Order_");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.Chapter).WithMany(p => p.Contents)
                .HasForeignKey(d => d.ChapterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Content__Chapter__4CA06362");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PK__Course__C92D71A7E99C1F7F");

            entity.ToTable("Course");

            entity.HasIndex(e => e.UserId, "IX_Course_UserId");

            entity.Property(e => e.Description).IsUnicode(false);
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.User).WithMany(p => p.Courses)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Course__UserId__398D8EEE");

            entity.HasMany(d => d.MiniProjects).WithMany(p => p.Courses)
                .UsingEntity<Dictionary<string, object>>(
                    "CourseProject",
                    r => r.HasOne<MiniProject>().WithMany()
                        .HasForeignKey("MiniProjectId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__CoursePro__MiniP__5441852A"),
                    l => l.HasOne<Course>().WithMany()
                        .HasForeignKey("CourseId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK__CoursePro__Cours__534D60F1"),
                    j =>
                    {
                        j.HasKey("CourseId", "MiniProjectId").HasName("PK__CoursePr__52AD9073E0A7F8B9");
                        j.ToTable("CourseProject");
                        j.HasIndex(new[] { "MiniProjectId" }, "IX_CourseProject_MiniProjectId");
                    });
        });

        modelBuilder.Entity<MiniProject>(entity =>
        {
            entity.HasKey(e => e.MiniProjectId).HasName("PK__MiniProj__B80E1D483A994D45");

            entity.ToTable("MiniProject");

            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.Property(e => e.Description).IsUnicode(false);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime");
        });

        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.QuestionId).HasName("PK__Question__0DC06FACF9B8D13D");

            entity.ToTable("Question");

            entity.Property(e => e.Rank).HasDefaultValue(1);
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.Quiz).WithMany(p => p.Questions)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK__Question__QuizId__25518C17");
        });

        modelBuilder.Entity<QuestionItem>(entity =>
        {
            entity.HasKey(e => e.QuestionItemId).HasName("PK__Question__E0AA88D7C95173E1");

            entity.ToTable("QuestionItem");

            entity.HasOne(d => d.Question).WithMany(p => p.QuestionItems)
                .HasForeignKey(d => d.QuestionId)
                .HasConstraintName("FK__QuestionI__Quest__282DF8C2");
        });

        modelBuilder.Entity<QuestionResponse>(entity =>
        {
            entity.HasKey(e => e.QuestionResponseId).HasName("PK__Question__4BB9596583FA3DD4");

            entity.ToTable("QuestionResponse");

            entity.Property(e => e.ResponseContent).HasMaxLength(1000);

            entity.HasOne(d => d.Question).WithMany(p => p.QuestionResponses)
                .HasForeignKey(d => d.QuestionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__QuestionR__Quest__44CA3770");

            entity.HasOne(d => d.QuestionItem).WithMany(p => p.QuestionResponses)
                .HasForeignKey(d => d.QuestionItemId)
                .HasConstraintName("FK__QuestionR__Quest__45BE5BA9");

            entity.HasOne(d => d.QuizResponse).WithMany(p => p.QuestionResponses)
                .HasForeignKey(d => d.QuizResponseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__QuestionR__QuizR__43D61337");
        });

        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(e => e.QuizId).HasName("PK__Quiz__8B42AE8E5DBD145B");

            entity.ToTable("Quiz");

            entity.HasIndex(e => e.ChapterId, "IX_Quiz_ChapterId");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.Chapter).WithMany(p => p.Quizzes)
                .HasForeignKey(d => d.ChapterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Quiz_Chapter");
        });

        modelBuilder.Entity<QuizResponse>(entity =>
        {
            entity.HasKey(e => e.QuizResponseId).HasName("PK__QuizResp__13B12EBA447BFFFD");

            entity.ToTable("QuizResponse");

            entity.Property(e => e.AttemptNumber).HasDefaultValue(1);
            entity.Property(e => e.ResponseDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Quiz).WithMany(p => p.QuizResponses)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("FK__QuizRespo__QuizI__339FAB6E");

            entity.HasOne(d => d.User).WithMany(p => p.QuizResponses)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__QuizRespo__UserI__32AB8735");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__8AFACE1ACCC831E5");

            entity.ToTable("Role");

            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.TicketId).HasName("PK__Ticket__712CC607AF395881");

            entity.ToTable("Ticket");

            entity.HasIndex(e => e.MiniProjectId, "IX_Ticket_MiniProjectId");

            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.Property(e => e.Description).IsUnicode(false);

            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("pending");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.Property(e => e.UpdatedAt)
                .HasColumnType("datetime");

            entity.HasOne(d => d.MiniProject).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.MiniProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Ticket__MiniProj__49C3F6B7");
        });

        modelBuilder.Entity<Users>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User___1788CC4CCA7D56B4");

            entity.Property(e => e.Email)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.FirstName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.LastName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Password)
                .HasMaxLength(2000)
                .IsUnicode(false);
        });
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.RoleId }).HasName("PK__Asso_1__AF2760AD77210113");

            entity.ToTable("UserRole");

            entity.HasIndex(e => e.RoleId, "IX_UserRole_RoleId");

            entity.Property(e => e.DateAdded).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Role).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Asso_1__RoleId__5070F446");

            entity.HasOne(d => d.User).WithMany(p => p.UserRoles)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Asso_1__UserId__4F7CD00D");
        });

        // StudentCourseEnrollment configuration
        modelBuilder.Entity<StudentCourseEnrollment>(entity =>
        {
            entity.HasKey(e => e.EnrollmentId).HasName("PK__StudentCourseEnrollment__ID");

            entity.ToTable("StudentCourseEnrollment");

            entity.HasIndex(e => e.StudentId, "IX__StudentCourseEnrollment__StudentId");
            entity.HasIndex(e => e.CourseId, "IX__StudentCourseEnrollment__CourseId");
            entity.HasIndex(e => e.Status, "IX__StudentCourseEnrollment__Status");

            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("active");
            entity.Property(e => e.ProgressPercentage).HasDefaultValue(0);
            entity.Property(e => e.EnrollmentDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentCourseEnrollments)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Course).WithMany(p => p.StudentCourseEnrollments)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(new[] { "StudentId", "CourseId" }, "UQ__StudentCourseEnrollment__StudentId_CourseId").IsUnique();
        });

        // StudentChapterProgress configuration
        modelBuilder.Entity<StudentChapterProgress>(entity =>
        {
            entity.HasKey(e => e.ChapterProgressId).HasName("PK__StudentChapterProgress__ID");

            entity.ToTable("StudentChapterProgress");

            entity.HasIndex(e => e.StudentId, "IX__StudentChapterProgress__StudentId");
            entity.HasIndex(e => e.ChapterId, "IX__StudentChapterProgress__ChapterId");
            entity.HasIndex(e => e.Status, "IX__StudentChapterProgress__Status");

            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("not_started");
            entity.Property(e => e.ProgressPercentage).HasDefaultValue(0);
            entity.Property(e => e.StartedDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentChapterProgresses)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Chapter).WithMany(p => p.StudentChapterProgresses)
                .HasForeignKey(d => d.ChapterId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(new[] { "StudentId", "ChapterId" }, "UQ__StudentChapterProgress__StudentId_ChapterId").IsUnique();
        });

        // StudentQuizAttempt configuration
        modelBuilder.Entity<StudentQuizAttempt>(entity =>
        {
            entity.HasKey(e => e.QuizAttemptId).HasName("PK__StudentQuizAttempt__ID");

            entity.ToTable("StudentQuizAttempt");

            entity.HasIndex(e => e.StudentId, "IX__StudentQuizAttempt__StudentId");
            entity.HasIndex(e => e.QuizId, "IX__StudentQuizAttempt__QuizId");
            entity.HasIndex(e => e.Status, "IX__StudentQuizAttempt__Status");

            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("in_progress");
            entity.Property(e => e.AttemptNumber).HasDefaultValue(1);
            entity.Property(e => e.AttemptDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentQuizAttempts)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Quiz).WithMany(p => p.StudentQuizAttempts)
                .HasForeignKey(d => d.QuizId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.ChapterProgress).WithMany(p => p.StudentQuizAttempts)
                .HasForeignKey(d => d.ChapterProgressId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // StudentQuestionResponse configuration
        modelBuilder.Entity<StudentQuestionResponse>(entity =>
        {
            entity.HasKey(e => e.QuestionResponseId).HasName("PK__StudentQuestionResponse__ID");

            entity.ToTable("StudentQuestionResponse");

            entity.Property(e => e.ResponseContent)
                .HasMaxLength(1000);

            entity.HasOne(d => d.QuizAttempt).WithMany(p => p.StudentQuestionResponses)
                .HasForeignKey(d => d.QuizAttemptId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Question).WithMany()
                .HasForeignKey(d => d.QuestionId);

            entity.HasOne(d => d.QuestionItem).WithMany()
                .HasForeignKey(d => d.QuestionItemId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // StudentProjectEnrollment configuration
        modelBuilder.Entity<StudentProjectEnrollment>(entity =>
        {
            entity.HasKey(e => e.ProjectEnrollmentId).HasName("PK__StudentProjectEnrollment__ID");

            entity.ToTable("StudentProjectEnrollment");

            entity.HasIndex(e => e.StudentId, "IX__StudentProjectEnrollment__StudentId");
            entity.HasIndex(e => e.MiniProjectId, "IX__StudentProjectEnrollment__MiniProjectId");
            entity.HasIndex(e => e.Status, "IX__StudentProjectEnrollment__Status");

            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("active");
            entity.Property(e => e.ProgressPercentage).HasDefaultValue(0);
            entity.Property(e => e.EnrollmentDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentProjectEnrollments)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.MiniProject).WithMany(p => p.StudentProjectEnrollments)
                .HasForeignKey(d => d.MiniProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(new[] { "StudentId", "MiniProjectId" }, "UQ__StudentProjectEnrollment__StudentId_ProjectId").IsUnique();
        });

        // StudentTicketProgress configuration
        modelBuilder.Entity<StudentTicketProgress>(entity =>
        {
            entity.HasKey(e => e.TicketProgressId).HasName("PK__StudentTicketProgress__ID");

            entity.ToTable("StudentTicketProgress");

            entity.HasIndex(e => e.StudentId, "IX__StudentTicketProgress__StudentId");
            entity.HasIndex(e => e.TicketId, "IX__StudentTicketProgress__TicketId");
            entity.HasIndex(e => e.Status, "IX__StudentTicketProgress__Status");

            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("pending");
            entity.Property(e => e.ProgressPercentage).HasDefaultValue(0);

            entity.HasOne(d => d.Student).WithMany(p => p.StudentTicketProgresses)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Ticket).WithMany(p => p.StudentTicketProgresses)
                .HasForeignKey(d => d.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(new[] { "StudentId", "TicketId" }, "UQ__StudentTicketProgress__StudentId_TicketId").IsUnique();
        });

        // StudentAchievement configuration
        modelBuilder.Entity<StudentAchievement>(entity =>
        {
            entity.HasKey(e => e.AchievementId).HasName("PK__StudentAchievement__ID");

            entity.ToTable("StudentAchievement");

            entity.HasIndex(e => e.StudentId, "IX__StudentAchievement__StudentId");
            entity.HasIndex(e => e.AchievementType, "IX__StudentAchievement__AchievementType");

            entity.Property(e => e.Title)
                .HasMaxLength(255);
            entity.Property(e => e.AchievementType)
                .HasMaxLength(50);
            entity.Property(e => e.Points).HasDefaultValue(0);
            entity.Property(e => e.UnlockedDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentAchievements)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // StudentActivity configuration
        modelBuilder.Entity<StudentActivity>(entity =>
        {
            entity.HasKey(e => e.ActivityId).HasName("PK__StudentActivity__ID");

            entity.ToTable("StudentActivity");

            entity.HasIndex(e => e.StudentId, "IX__StudentActivity__StudentId");
            entity.HasIndex(e => e.ActivityType, "IX__StudentActivity__ActivityType");
            entity.HasIndex(e => e.ActivityDate, "IX__StudentActivity__ActivityDate");

            entity.Property(e => e.ActivityType)
                .HasMaxLength(50);
            entity.Property(e => e.RelatedEntityType)
                .HasMaxLength(50);
            entity.Property(e => e.ActivityDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentActivities)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // CourseMiniProject configuration
        modelBuilder.Entity<CourseMiniProject>(entity =>
        {
            entity.HasKey(e => e.CourseMiniProjectId).HasName("PK__CourseMiniProject__52AD9073E0A7F8B9");

            entity.ToTable("CourseMiniProject");

            entity.HasIndex(e => e.CourseId, "IX__CourseMiniProject__CourseId");
            entity.HasIndex(e => e.MiniProjectId, "IX__CourseMiniProject__MiniProjectId");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Course).WithMany(p => p.CourseMiniProjects)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.MiniProject).WithMany(p => p.CourseMiniProjects)
                .HasForeignKey(d => d.MiniProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(new[] { "CourseId", "MiniProjectId" }, "UQ__CourseMiniProject__CourseId_MiniProjectId").IsUnique();
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
