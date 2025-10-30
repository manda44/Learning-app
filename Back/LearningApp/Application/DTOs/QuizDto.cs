namespace LearningApp.Application.DTOs
{
    public class QuizDto
    {
        public int QuizId { get; set; }
        public int ChapterId { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; }
        public int CourseId { get; set; }
        public int QuestionCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public int SuccessPercentage { get; set; }
        public string CourseName { get; set; }
        public string ChapterName { get; set; }
    }

    public class QuizCreateDto
    {
        public int ChapterId { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; }
        public int SuccessPercentage { get; set; }
    }

    public class QuizUpdateDto
    {
        public int QuizId { get; set; }
        public int ChapterId { get; set; }
        public string Description { get; set; }
        public string Title { get; set; } = null!;
        public int SuccessPercentage { get; set; }
    }
}
