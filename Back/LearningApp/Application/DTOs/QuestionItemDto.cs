namespace LearningApp.Application.DTOs
{
    public class QuestionItemDto
    {
        public int QuestionItemId { get; set; }
        public int QuestionId { get; set; }
        public string? Content { get; set; }
        public bool? IsRight { get; set; }
        public string? RightResponse { get; set; }
    }

    public class QuestionItemCreateDto
    {
        public int QuestionId { get; set; }
        public string? Content { get; set; }
        public bool? IsRight { get; set; }
        public string? RightResponse { get; set; }
    }

    public class QuestionItemUpdateDto
    {
        public int QuestionItemId { get; set; }
        public int QuestionId { get; set; }
        public string? Content { get; set; }
        public bool? IsRight { get; set; }
        public string? RightResponse { get; set; }
    }
}
