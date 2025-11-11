using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearningApp.Domain;
using LearningApp.Infrastructure.Data;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MiniProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MiniProjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/MiniProjects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MiniProject>>> GetMiniProjects()
        {
            return await _context.MiniProjects
                .Include(mp => mp.Tickets)
                .Include(mp => mp.Course)
                .ToListAsync();
        }

        // GET: api/MiniProjects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MiniProject>> GetMiniProject(int id)
        {
            var miniProject = await _context.MiniProjects
                .Include(mp => mp.Tickets)
                .Include(mp => mp.Course)
                .FirstOrDefaultAsync(mp => mp.MiniProjectId == id);

            if (miniProject == null)
            {
                return NotFound();
            }

            return miniProject;
        }

        // PUT: api/MiniProjects/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutMiniProject(int id, MiniProject miniProject)
        {
            if (id != miniProject.MiniProjectId)
            {
                return BadRequest();
            }

            var existingProject = await _context.MiniProjects.FindAsync(id);
            if (existingProject == null)
            {
                return NotFound();
            }

            existingProject.Title = miniProject.Title;
            existingProject.Description = miniProject.Description;
            existingProject.CourseId = miniProject.CourseId;
            existingProject.UpdatedAt = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MiniProjectExists(id))
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

        // POST: api/MiniProjects
        [HttpPost]
        public async Task<ActionResult<MiniProject>> PostMiniProject(MiniProject miniProject)
        {
            miniProject.CreatedAt = DateTime.Now;
            miniProject.UpdatedAt = DateTime.Now;

            _context.MiniProjects.Add(miniProject);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMiniProject", new { id = miniProject.MiniProjectId }, miniProject);
        }

        // DELETE: api/MiniProjects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMiniProject(int id)
        {
            var miniProject = await _context.MiniProjects.FindAsync(id);
            if (miniProject == null)
            {
                return NotFound();
            }

            _context.MiniProjects.Remove(miniProject);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/MiniProjects/5/tickets
        [HttpGet("{id}/tickets")]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetMiniProjectTickets(int id)
        {
            var tickets = await _context.Tickets
                .Where(t => t.MiniProjectId == id)
                .ToListAsync();

            return tickets;
        }

        // GET: api/MiniProjects/course/5
        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<MiniProject>>> GetMiniProjectsByCourse(int courseId)
        {
            var miniProjects = await _context.MiniProjects
                .Include(mp => mp.Tickets)
                .Where(mp => mp.CourseId == courseId)
                .ToListAsync();

            return miniProjects;
        }

        private bool MiniProjectExists(int id)
        {
            return _context.MiniProjects.Any(e => e.MiniProjectId == id);
        }
    }
}
