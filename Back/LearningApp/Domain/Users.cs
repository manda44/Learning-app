using System;
using System.Collections.Generic;

namespace LearningApp.Domain;

public partial class Users
{
    public int UserId { get; set; }

    public string FirstName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public DateTime? CreationDate { get; set; }

    public string? Password { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<ConnexionHistory> ConnexionHistories { get; set; } = new List<ConnexionHistory>();

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    public virtual ICollection<QuizResponse> QuizResponses { get; set; } = new List<QuizResponse>();

    // Student relationships
    public virtual ICollection<StudentCourseEnrollment> StudentCourseEnrollments { get; set; } = new List<StudentCourseEnrollment>();

    public virtual ICollection<StudentChapterProgress> StudentChapterProgresses { get; set; } = new List<StudentChapterProgress>();

    public virtual ICollection<StudentQuizAttempt> StudentQuizAttempts { get; set; } = new List<StudentQuizAttempt>();

    public virtual ICollection<StudentProjectEnrollment> StudentProjectEnrollments { get; set; } = new List<StudentProjectEnrollment>();

    public virtual ICollection<StudentTicketProgress> StudentTicketProgresses { get; set; } = new List<StudentTicketProgress>();

    public virtual ICollection<StudentAchievement> StudentAchievements { get; set; } = new List<StudentAchievement>();

    public virtual ICollection<StudentActivity> StudentActivities { get; set; } = new List<StudentActivity>();

    // Chat relationships
    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    public virtual ICollection<ChatConversationParticipant> ChatConversationParticipants { get; set; } = new List<ChatConversationParticipant>();

    public virtual ICollection<ChatConversation> ChatConversationsAsStudent { get; set; } = new List<ChatConversation>();

    public virtual ICollection<ChatConversation> ChatConversationsAsAdmin { get; set; } = new List<ChatConversation>();
}
