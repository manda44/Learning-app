namespace LearningApp.Application.DTOs
{
    public class ContentDto
    {
        public int ContentId { get; set; }
        public string Type { get; set; } = null!;
        public string? Data { get; set; }
        public int Order { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ChapterId { get; set; }
    }

    public class ContentCreateDto
    {
        public string? Data { get; set; }
        public int ChapterId { get; set; }
    }

    public class ContentUpdateDto
    {
        public int ContentId { get; set; }
        public string Type { get; set; } = null!;
        public string? Data { get; set; }
        public int Order { get; set; }
        public int ChapterId { get; set; }
    }
}