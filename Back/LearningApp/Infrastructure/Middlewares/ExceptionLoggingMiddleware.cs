using Microsoft.AspNetCore.Http;
using NLog;
using System;
using System.Threading.Tasks;
namespace LearningApp.Infrastructure.Middlewares
{
    public class ExceptionLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

        public ExceptionLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var now = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                Logger.Error(ex, $"[{now}] Unhandled exception occurred.");
                context.Response.StatusCode = 500;
                await context.Response.WriteAsync("An unexpected error occurred.");
            }
        }
    }
}
