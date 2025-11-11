using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;
using LearningApp.Application.DTOs;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Tickets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetTickets()
        {
            return await _context.Tickets.ToListAsync();
        }

        // GET: api/Tickets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);

            if (ticket == null)
            {
                return NotFound();
            }

            return ticket;
        }

        // PUT: api/Tickets/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTicket(int id, UpdateTicketDto ticketDto)
        {
            var existingTicket = await _context.Tickets.FindAsync(id);
            if (existingTicket == null)
            {
                return NotFound();
            }

            existingTicket.Title = ticketDto.Title;
            existingTicket.Description = ticketDto.Description;
            existingTicket.Status = ticketDto.Status;
            existingTicket.UpdatedAt = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TicketExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Tickets
        [HttpPost]
        public async Task<ActionResult<Ticket>> PostTicket(CreateTicketDto ticketDto)
        {
            var ticket = new Ticket
            {
                MiniProjectId = ticketDto.MiniProjectId,
                Title = ticketDto.Title,
                Description = ticketDto.Description,
                Status = string.IsNullOrEmpty(ticketDto.Status) ? "pending" : ticketDto.Status,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTicket", new { id = ticket.TicketId }, ticket);
        }

        // DELETE: api/Tickets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTicket(int id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null)
            {
                return NotFound();
            }

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Tickets/pending-validation
        [HttpGet("pending-validation")]
        public async Task<ActionResult<IEnumerable<PendingValidationTicketDto>>> GetPendingValidationTickets()
        {
            var completedTickets = await _context.StudentTicketProgresses
                .Include(tp => tp.Ticket)
                .ThenInclude(t => t.MiniProject)
                .ThenInclude(mp => mp.Course)
                .Include(tp => tp.Student)
                .Where(tp => tp.Status == "completed")
                .OrderByDescending(tp => tp.CompletedDate)
                .Select(tp => new PendingValidationTicketDto
                {
                    TicketProgressId = tp.TicketProgressId,
                    StudentId = tp.StudentId,
                    StudentName = tp.Student.FirstName + " " + tp.Student.LastName,
                    StudentEmail = tp.Student.Email,
                    TicketId = tp.TicketId,
                    TicketTitle = tp.Ticket.Title,
                    TicketDescription = tp.Ticket.Description,
                    MiniProjectId = tp.Ticket.MiniProjectId,
                    MiniProjectTitle = tp.Ticket.MiniProject.Title,
                    CourseId = tp.Ticket.MiniProject.CourseId,
                    CourseName = tp.Ticket.MiniProject.Course.Title,
                    CompletedDate = tp.CompletedDate,
                    Notes = tp.Notes
                })
                .ToListAsync();

            return Ok(completedTickets);
        }

        // GET: api/Tickets/pending-validation/course/{courseId}
        [HttpGet("pending-validation/course/{courseId}")]
        public async Task<ActionResult<IEnumerable<PendingValidationTicketDto>>> GetPendingValidationTicketsByCourse(int courseId)
        {
            var completedTickets = await _context.StudentTicketProgresses
                .Include(tp => tp.Ticket)
                .ThenInclude(t => t.MiniProject)
                .ThenInclude(mp => mp.Course)
                .Include(tp => tp.Student)
                .Where(tp => tp.Status == "completed" && tp.Ticket.MiniProject.CourseId == courseId)
                .OrderByDescending(tp => tp.CompletedDate)
                .Select(tp => new PendingValidationTicketDto
                {
                    TicketProgressId = tp.TicketProgressId,
                    StudentId = tp.StudentId,
                    StudentName = tp.Student.FirstName + " " + tp.Student.LastName,
                    StudentEmail = tp.Student.Email,
                    TicketId = tp.TicketId,
                    TicketTitle = tp.Ticket.Title,
                    TicketDescription = tp.Ticket.Description,
                    MiniProjectId = tp.Ticket.MiniProjectId,
                    MiniProjectTitle = tp.Ticket.MiniProject.Title,
                    CourseId = tp.Ticket.MiniProject.CourseId,
                    CourseName = tp.Ticket.MiniProject.Course.Title,
                    CompletedDate = tp.CompletedDate,
                    Notes = tp.Notes
                })
                .ToListAsync();

            return Ok(completedTickets);
        }

        // PUT: api/Tickets/{ticketProgressId}/validate
        [HttpPut("{ticketProgressId}/validate")]
        public async Task<IActionResult> ValidateTicket(int ticketProgressId)
        {
            var ticketProgress = await _context.StudentTicketProgresses.FindAsync(ticketProgressId);
            if (ticketProgress == null)
            {
                return NotFound();
            }

            if (ticketProgress.Status != "completed")
            {
                return BadRequest(new { message = "Only completed tickets can be validated" });
            }

            ticketProgress.Status = "validated";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TicketExists(int id)
        {
            return _context.Tickets.Any(e => e.TicketId == id);
        }
    }
}
