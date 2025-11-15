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
    public class ChatMessageController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatMessageController> _logger;

        public ChatMessageController(IChatService chatService, ILogger<ChatMessageController> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        /// <summary>
        /// Send a new chat message
        /// </summary>
        [HttpPost("send")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ChatMessageDto>> SendMessage([FromBody] CreateChatMessageDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var message = await _chatService.SendMessageAsync(createDto);
                return CreatedAtAction(nameof(GetMessage), new { id = message.ChatMessageId }, message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Message sending failed: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending message: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while sending the message.");
            }
        }

        /// <summary>
        /// Get a specific message by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ChatMessageDto>> GetMessage(int id)
        {
            try
            {
                var message = await _chatService.GetMessageAsync(id);
                return Ok(message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Message not found: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving message: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the message.");
            }
        }

        /// <summary>
        /// Get all messages in a conversation with pagination
        /// </summary>
        [HttpGet("conversation/{conversationId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<ChatMessageDto>>> GetConversationMessages(int conversationId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                if (pageNumber < 1)
                    return BadRequest("Page number must be greater than 0.");

                if (pageSize < 1 || pageSize > 100)
                    return BadRequest("Page size must be between 1 and 100.");

                var messages = await _chatService.GetConversationMessagesAsync(conversationId, pageNumber, pageSize);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving conversation messages: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving messages.");
            }
        }

        /// <summary>
        /// Edit a chat message
        /// </summary>
        [HttpPut("{id}/edit")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ChatMessageDto>> EditMessage(int id, [FromBody] UpdateChatMessageDto updateDto, [FromQuery] int userId)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var message = await _chatService.EditMessageAsync(id, updateDto, userId);
                return Ok(message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Message edit failed: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning($"Unauthorized message edit: {ex.Message}");
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error editing message: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while editing the message.");
            }
        }

        /// <summary>
        /// Delete a chat message (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteMessage(int id, [FromQuery] int userId)
        {
            try
            {
                var result = await _chatService.DeleteMessageAsync(id, userId);
                if (!result)
                    return NotFound("Message not found.");

                return Ok(new { message = "Message deleted successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning($"Unauthorized message deletion: {ex.Message}");
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting message: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the message.");
            }
        }
    }
}
