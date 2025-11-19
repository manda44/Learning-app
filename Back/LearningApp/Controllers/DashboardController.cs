using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LearningApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        // GET: api/Dashboard/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetDashboardStats()
        {
            // Static data for now
            var stats = new
            {
                totalUsers = 156,
                activeCourses = 23,
                miniProjects = 89,
                validatedTickets = 342
            };

            return Ok(stats);
        }

        // GET: api/Dashboard/user-progression
        [HttpGet("user-progression")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserProgression()
        {
            // Static data for line chart
            var data = new List<object>
            {
                new { month = "Jan", active = 65, completed = 30 },
                new { month = "Fev", active = 70, completed = 35 },
                new { month = "Mar", active = 75, completed = 38 },
                new { month = "Avr", active = 80, completed = 42 },
                new { month = "Mai", active = 85, completed = 45 },
                new { month = "Jun", active = 88, completed = 50 },
                new { month = "Jul", active = 90, completed = 52 }
            };

            return Ok(data);
        }

        // GET: api/Dashboard/monthly-activity
        [HttpGet("monthly-activity")]
        public async Task<ActionResult<IEnumerable<object>>> GetMonthlyActivity()
        {
            // Static data for bar chart
            var data = new List<object>
            {
                new { month = "Lun", completions = 45, incomplete = 20 },
                new { month = "Mar", completions = 55, incomplete = 18 },
                new { month = "Mer", completions = 40, incomplete = 25 },
                new { month = "Jeu", completions = 65, incomplete = 15 },
                new { month = "Ven", completions = 75, incomplete = 12 },
                new { month = "Sam", completions = 25, incomplete = 30 },
                new { month = "Dim", completions = 20, incomplete = 35 }
            };

            return Ok(data);
        }

        // GET: api/Dashboard/popular-courses
        [HttpGet("popular-courses")]
        public async Task<ActionResult<IEnumerable<object>>> GetPopularCourses()
        {
            // Static data for popular courses
            var data = new List<object>
            {
                new { name = "JavaScript Avancé", progress = 85, color = "#4A9FD8" },
                new { name = "React Fundamentals", progress = 77, color = "#50C878" },
                new { name = "Node.js Backend", progress = 58, color = "#FFB84D" },
                new { name = "Git & GitHub", progress = 95, color = "#FF6B6B" }
            };

            return Ok(data);
        }

        // GET: api/Dashboard/enrollment-stats
        [HttpGet("enrollment-stats")]
        public async Task<ActionResult<object>> GetEnrollmentStats()
        {
            // Static data for enrollment statistics
            var stats = new
            {
                totalEnrolled = 156,
                completed = 45,
                inProgress = 78,
                notStarted = 33
            };

            return Ok(stats);
        }

        // GET: api/Dashboard/ticket-stats
        [HttpGet("ticket-stats")]
        public async Task<ActionResult<object>> GetTicketStats()
        {
            // Static data for ticket statistics
            var stats = new
            {
                total = 342,
                validated = 280,
                pending = 42,
                rejected = 20
            };

            return Ok(stats);
        }
    }
}
