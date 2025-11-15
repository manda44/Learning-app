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
    public class ChatParticipantController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly ILogger<ChatParticipantController> _logger;

        public ChatParticipantController(IChatService chatService, ILogger<ChatParticipantController> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        /// <summary>
        /// Add a participant to a conversation
        /// </summary>
        [HttpPost("add")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ChatConversationParticipantDto>> AddParticipant([FromBody] CreateChatConversationParticipantDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var participant = await _chatService.AddParticipantAsync(createDto);
                return CreatedAtAction(nameof(GetParticipants), new { conversationId = createDto.ChatConversationId }, participant);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Participant addition failed: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding participant: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while adding the participant.");
            }
        }

        /// <summary>
        /// Get all participants in a conversation
        /// </summary>
        [HttpGet("conversation/{conversationId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<ChatConversationParticipantDto>>> GetParticipants(int conversationId)
        {
            try
            {
                var participants = await _chatService.GetConversationParticipantsAsync(conversationId);
                return Ok(participants);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving participants: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving participants.");
            }
        }

        /// <summary>
        /// Update a participant (e.g., mark as read)
        /// </summary>
        [HttpPut("{participantId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ChatConversationParticipantDto>> UpdateParticipant(int participantId, [FromBody] UpdateChatConversationParticipantDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var participant = await _chatService.UpdateParticipantAsync(participantId, updateDto);
                return Ok(participant);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Participant update failed: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating participant: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the participant.");
            }
        }

        /// <summary>
        /// Remove a participant from a conversation (soft delete)
        /// </summary>
        [HttpDelete("{participantId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveParticipant(int participantId)
        {
            try
            {
                var result = await _chatService.RemoveParticipantAsync(participantId);
                if (!result)
                    return NotFound("Participant not found.");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error removing participant: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while removing the participant.");
            }
        }
    }
}
