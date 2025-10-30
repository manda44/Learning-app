using System;
using System.Collections.Generic;
using LearningApp.TempModels;
using Microsoft.EntityFrameworkCore;

namespace LearningApp.TempContext;

public partial class TempContext : DbContext
{
    public TempContext()
    {
    }

    public TempContext(DbContextOptions<TempContext> options)
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

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserAccount> UserAccounts { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=DESKTOP-OJMN97K\\SQLEXPRESS;Database=LearningApp;Trusted_Connection=True;Trust Server Certificate=True");

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
            entity.Property(e => e.Order).HasColumnName("Order_");
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

            entity.HasOne(d => d.MiniProject).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.MiniProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Ticket__MiniProj__49C3F6B7");
        });

        modelBuilder.Entity<User>(entity =>
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

        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__UserAcco__3214EC0741792F08");

            entity.ToTable("UserAccount");

            entity.HasIndex(e => e.Email, "UQ__UserAcco__A9D105347DCC8E1C").IsUnique();

            entity.HasIndex(e => e.UserName, "UQ__UserAcco__C9F284560621610F").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.UserName).HasMaxLength(100);
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

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
