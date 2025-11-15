using System;

namespace LearningApp.Domain
{
    public class ChatMessageAttachment
    {
        public int ChatMessageAttachmentId { get; set; }
        public int ChatMessageId { get; set; }
        public string FileType { get; set; } // "image", "file", "video"
        public string OriginalFileName { get; set; }
        public string StoredFileName { get; set; }
        public string FileUrl { get; set; }
        public long FileSizeBytes { get; set; }
        public string MimeType { get; set; }
        public int? ImageWidth { get; set; }
        public int? ImageHeight { get; set; }
        public string ThumbnailUrl { get; set; }
        public DateTime UploadedAt { get; set; }

        // Navigation properties
        public virtual ChatMessage ChatMessage { get; set; }
    }
}
