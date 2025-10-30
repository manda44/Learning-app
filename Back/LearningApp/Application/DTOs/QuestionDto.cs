namespace LearningApp.Application.DTOs
{
    public class QuestionDto
    {
        public int QuestionId { get; set; }
        public int QuizId { get; set; }
        public string Type { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int Rank { get; set; }
        public string? Explanation { get; set; }
        public List<QuestionItemDto> QuestionItems { get; set; }
    }

    public class QuestionCreateDto
    {
        public int QuizId { get; set; }
        public string Type { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int Rank { get; set; }
        public string? Explanation { get; set; }
        public List<QuestionItemCreateDto> QuestionItems { get; set; }
    }

    public class QuestionUpdateDto
    {
        public int QuestionId { get; set; }
        public int QuizId { get; set; }
        public string Type { get; set; } = null!;
        public string Content { get; set; } = null!;
        public int Rank { get; set; }
        public string? Explanation { get; set; }
    }
}
