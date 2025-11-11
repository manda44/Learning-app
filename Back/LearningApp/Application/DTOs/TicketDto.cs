namespace LearningApp.Application.DTOs
{
    public class CreateTicketDto
    {
        public int MiniProjectId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
    }

    public class UpdateTicketDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
    }
}
