using System;
using System.Text.Json.Serialization;

namespace LearningApp.Application.DTOs
{
    public class ChatMessageAttachmentDto
    {
        [JsonPropertyName("chatMessageAttachmentId")]
        public int ChatMessageAttachmentId { get; set; }

        [JsonPropertyName("chatMessageId")]
        public int ChatMessageId { get; set; }

        [JsonPropertyName("fileType")]
        public string FileType { get; set; }

        [JsonPropertyName("originalFileName")]
        public string OriginalFileName { get; set; }

        [JsonPropertyName("storedFileName")]
        public string StoredFileName { get; set; }

        [JsonPropertyName("fileUrl")]
        public string FileUrl { get; set; }

        [JsonPropertyName("fileSizeBytes")]
        public long FileSizeBytes { get; set; }

        [JsonPropertyName("mimeType")]
        public string MimeType { get; set; }

        [JsonPropertyName("imageWidth")]
        public int? ImageWidth { get; set; }

        [JsonPropertyName("imageHeight")]
        public int? ImageHeight { get; set; }

        [JsonPropertyName("thumbnailUrl")]
        public string ThumbnailUrl { get; set; }

        [JsonPropertyName("uploadedAt")]
        public DateTime UploadedAt { get; set; }
    }

    public class CreateChatMessageAttachmentDto
    {
        [JsonPropertyName("chatMessageId")]
        public int ChatMessageId { get; set; }

        [JsonPropertyName("fileType")]
        public string FileType { get; set; } // "image", "file", "video"

        [JsonPropertyName("originalFileName")]
        public string OriginalFileName { get; set; }

        [JsonPropertyName("storedFileName")]
        public string StoredFileName { get; set; }

        [JsonPropertyName("mimeType")]
        public string MimeType { get; set; }

        [JsonPropertyName("fileSizeBytes")]
        public long FileSizeBytes { get; set; }

        [JsonPropertyName("imageWidth")]
        public int? ImageWidth { get; set; }

        [JsonPropertyName("imageHeight")]
        public int? ImageHeight { get; set; }

        [JsonPropertyName("fileUrl")]
        public string FileUrl { get; set; }

        [JsonPropertyName("thumbnailUrl")]
        public string ThumbnailUrl { get; set; }
    }
}
