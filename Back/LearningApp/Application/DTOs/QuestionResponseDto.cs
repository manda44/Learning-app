namespace LearningApp.Application.DTOs
{
    public class QuestionResponseDto
    {
        public int QuestionResponseId { get; set; }
        public int QuizResponseId { get; set; }
        public int QuestionId { get; set; }
        public int? QuestionItemId { get; set; }
        public string? ResponseContent { get; set; }
    }

    public class QuestionResponseCreateDto
    {
        public int QuizResponseId { get; set; }
        public int QuestionId { get; set; }
        public int? QuestionItemId { get; set; }
        public string? ResponseContent { get; set; }
    }

    public class QuestionResponseUpdateDto
    {
        public int QuestionResponseId { get; set; }
        public int QuizResponseId { get; set; }
        public int QuestionId { get; set; }
        public int? QuestionItemId { get; set; }
        public string? ResponseContent { get; set; }
    }
}
