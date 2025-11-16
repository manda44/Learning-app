using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace LearningApp.Controllers
{
    [ApiController]
    [Route("api/ChatAttachment")]
    public class ChatAttachmentController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatAttachmentController> _logger;
        private readonly string _uploadPath;

        public ChatAttachmentController(IChatService chatService, ILogger<ChatAttachmentController> logger, IConfiguration configuration)
        {
            _chatService = chatService;
            _logger = logger;
            _uploadPath = configuration["ChatUploadPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads", "chat");
        }

        /// <summary>
        /// Upload an attachment to a chat message
        /// </summary>
        [HttpPost("upload")]
        [DisableRequestSizeLimit]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ChatMessageAttachmentDto>> UploadAttachment(int chatMessageId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("No file was provided.");

                // Validate file size (max 50MB)
                const long maxFileSize = 50 * 1024 * 1024;
                if (file.Length > maxFileSize)
                    return BadRequest("File size exceeds the maximum limit of 50MB.");

                // Validate file type
                var allowedMimeTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "video/mp4", "video/webm" };
                if (Array.IndexOf(allowedMimeTypes, file.ContentType) < 0)
                    return BadRequest("File type is not allowed.");

                // Create upload directory if it doesn't exist
                Directory.CreateDirectory(_uploadPath);

                // Generate unique filename
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(_uploadPath, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Get image dimensions if applicable
                int? imageWidth = null;
                int? imageHeight = null;
                if (file.ContentType.StartsWith("image/"))
                {
                    try
                    {
                        using (var stream = System.Drawing.Image.FromStream(file.OpenReadStream()))
                        {
                            imageWidth = stream.Width;
                            imageHeight = stream.Height;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning($"Could not read image dimensions: {ex.Message}");
                    }
                }

                // Create attachment DTO with placeholder FileUrl (will be updated with real ID after save)
                var createDto = new CreateChatMessageAttachmentDto
                {
                    ChatMessageId = chatMessageId,
                    FileType = file.ContentType.StartsWith("image/") ? "image" : (file.ContentType.StartsWith("video/") ? "video" : "file"),
                    OriginalFileName = file.FileName,
                    StoredFileName = fileName,
                    MimeType = file.ContentType,
                    FileSizeBytes = file.Length,
                    ImageWidth = imageWidth,
                    ImageHeight = imageHeight,
                    FileUrl = "", // Will be set after attachment is saved
                    ThumbnailUrl = file.ContentType.StartsWith("image/") ? "" : null // Will be set after attachment is saved
                };

                var attachment = await _chatService.UploadAttachmentAsync(chatMessageId, createDto);

                // Build absolute URLs using current request context
                var baseUrl = $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}";
                var downloadUrl = $"{baseUrl}/api/ChatAttachment/download/{attachment.ChatMessageAttachmentId}";
                var thumbnailUrl = attachment.FileType == "image" ? $"{baseUrl}/api/ChatAttachment/thumbnail/{attachment.ChatMessageAttachmentId}" : null;

                // Update FileUrl with actual attachment ID and save to database
                await _chatService.UpdateAttachmentUrlAsync(attachment.ChatMessageAttachmentId,
                    downloadUrl,
                    thumbnailUrl);

                // Reload attachment with updated URLs
                attachment = await _chatService.GetAttachmentAsync(attachment.ChatMessageAttachmentId);

                _logger.LogInformation($"Returning attachment to client: ID={attachment.ChatMessageAttachmentId}, FileUrl={attachment.FileUrl}, StoredFileName={attachment.StoredFileName}");

                return CreatedAtAction(nameof(GetAttachments), new { messageId = chatMessageId }, attachment);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Attachment upload failed: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error uploading attachment: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while uploading the attachment.");
            }
        }

        /// <summary>
        /// Get all attachments for a message
        /// </summary>
        [HttpGet("message/{messageId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<ChatMessageAttachmentDto>>> GetAttachments(int messageId)
        {
            try
            {
                var attachments = await _chatService.GetMessageAttachmentsAsync(messageId);
                return Ok(attachments);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Attachments retrieval failed: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving attachments: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving attachments.");
            }
        }

        /// <summary>
        /// Download an attachment file
        /// </summary>
        [HttpGet("download/{attachmentId}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DownloadAttachment(int attachmentId)
        {
            try
            {
                _logger.LogInformation($"DownloadAttachment called with attachmentId: {attachmentId}");

                // Get attachment from database
                var attachment = await _chatService.GetAttachmentAsync(attachmentId);
                if (attachment == null)
                {
                    _logger.LogWarning($"Attachment not found in database: {attachmentId}");
                    return NotFound("Attachment not found.");
                }

                // Build file path
                var filePath = Path.Combine(_uploadPath, attachment.StoredFileName);
                _logger.LogInformation($"Attempting to serve file from: {filePath}");

                // Check if file exists
                if (!System.IO.File.Exists(filePath))
                {
                    _logger.LogWarning($"Attachment file not found on disk: {filePath}");
                    return NotFound("File not found.");
                }

                // Read file and return as file result
                var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                _logger.LogInformation($"Serving file: {attachment.OriginalFileName}, Size: {fileBytes.Length} bytes");
                return File(fileBytes, attachment.MimeType, attachment.OriginalFileName);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error downloading attachment: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while downloading the attachment.");
            }
        }

        /// <summary>
        /// Get thumbnail for an image attachment
        /// </summary>
        [HttpGet("thumbnail/{attachmentId}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetThumbnail(int attachmentId)
        {
            try
            {
                // In a real implementation, you would generate/serve the thumbnail
                return Ok(new { message = "Thumbnail endpoint placeholder. Implement thumbnail generation logic." });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving thumbnail: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the thumbnail.");
            }
        }

        /// <summary>
        /// Delete an attachment
        /// </summary>
        [HttpDelete("{attachmentId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteAttachment(int attachmentId, [FromQuery] int userId)
        {
            try
            {
                var result = await _chatService.DeleteAttachmentAsync(attachmentId, userId);
                if (!result)
                    return NotFound("Attachment not found.");

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning($"Unauthorized attachment deletion: {ex.Message}");
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting attachment: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the attachment.");
            }
        }
    }
}
