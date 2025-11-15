using LearningApp.Application.DTOs;
using LearningApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LearningApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatConversationController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatConversationController> _logger;

        public ChatConversationController(IChatService chatService, ILogger<ChatConversationController> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new chat conversation between student and admin for a course
        /// </summary>
        [HttpPost("create")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ChatConversationDto>> CreateConversation([FromBody] CreateChatConversationDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var conversation = await _chatService.CreateConversationAsync(createDto);
                return CreatedAtAction(nameof(GetConversation), new { id = conversation.ChatConversationId }, conversation);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Conversation creation failed: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating conversation: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the conversation.");
            }
        }

        /// <summary>
        /// Get a conversation by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ChatConversationDto>> GetConversation(int id)
        {
            try
            {
                var conversation = await _chatService.GetConversationAsync(id);
                return Ok(conversation);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Conversation not found: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving conversation: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the conversation.");
            }
        }

        /// <summary>
        /// Get all conversations for the current user
        /// </summary>
        [HttpGet("user/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<ChatConversationDto>>> GetUserConversations(int userId)
        {
            try
            {
                var conversations = await _chatService.GetUserConversationsAsync(userId);
                return Ok(conversations);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving user conversations: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving conversations.");
            }
        }

        /// <summary>
        /// Get conversation for a specific course and student
        /// </summary>
        [HttpGet("course/{courseId}/student/{studentId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<ChatConversationDto>>> GetCourseStudentConversation(int courseId, int studentId)
        {
            try
            {
                var conversations = await _chatService.GetCourseStudentConversationAsync(courseId, studentId);
                return Ok(conversations);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving course student conversation: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the conversation.");
            }
        }

        /// <summary>
        /// Update a conversation
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ChatConversationDto>> UpdateConversation(int id, [FromBody] UpdateChatConversationDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var conversation = await _chatService.UpdateConversationAsync(id, updateDto);
                return Ok(conversation);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Conversation update failed: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating conversation: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the conversation.");
            }
        }

        /// <summary>
        /// Delete a conversation
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteConversation(int id)
        {
            try
            {
                var result = await _chatService.DeleteConversationAsync(id);
                if (!result)
                    return NotFound("Conversation not found.");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting conversation: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the conversation.");
            }
        }

        /// <summary>
        /// Mark conversation as read for the current user
        /// </summary>
        [HttpPost("{id}/mark-as-read")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MarkAsRead(int id, [FromBody] MarkAsReadDto markAsReadDto)
        {
            try
            {
                var result = await _chatService.MarkConversationAsReadAsync(id, markAsReadDto.UserId);
                if (!result)
                    return NotFound("Conversation not found.");

                return Ok(new { message = "Conversation marked as read." });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error marking conversation as read: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while marking the conversation as read.");
            }
        }
    }

    /// <summary>
    /// DTO for marking conversation as read
    /// </summary>
    public class MarkAsReadDto
    {
        public int UserId { get; set; }
    }
}
