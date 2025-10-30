namespace LearningApp.Application.DTOs
{
    public class ChapterDto
    {
        public int ChapterId { get; set; }
        public string Title { get; set; }
        public int Order { get; set; }

        public string Color { get; set; } = null!;
        public int CourseId { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAd { get; set; }
    }

    public class ChapterCreateDto
    {
        public string Title { get; set; }
        public int Order { get; set; }

        public string Color { get; set; } = null!;
        public int CourseId { get; set; }
        public string? Description { get; set; }
    }

    public class ChapterUpdateDto
    {
        public int ChapterId { get; set; }
        public string Title { get; set; }

        public string Color { get; set; } = null!;
        public int Order { get; set; }
        public int CourseId { get; set; }
        public string? Description { get; set; }
    }

    public class ChapterTitleUpdateDto
    {
        public string Title { get; set; } = null!;
    }
}
