namespace LearningApp.Application.DTOs
{
    public class QuizResponseDto
    {
        public int QuizResponseId { get; set; }
        public int UserId { get; set; }
        public int QuizId { get; set; }
        public int AttemptNumber { get; set; }
        public DateTime ResponseDate { get; set; }
        public int? Rank { get; set; }
    }

    public class QuizResponseCreateDto
    {
        public int UserId { get; set; }
        public int QuizId { get; set; }
        public int AttemptNumber { get; set; }
        public DateTime ResponseDate { get; set; }
        public int? Rank { get; set; }
    }

    public class QuizResponseUpdateDto
    {
        public int QuizResponseId { get; set; }
        public int UserId { get; set; }
        public int QuizId { get; set; }
        public int AttemptNumber { get; set; }
        public DateTime ResponseDate { get; set; }
        public int? Rank { get; set; }
    }
}
