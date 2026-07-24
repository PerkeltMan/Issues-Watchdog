using Microsoft.EntityFrameworkCore;

namespace api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Database
            builder.Services.AddDbContext<MyContext>(options =>
                options.UseNpgsql(
                    builder.Configuration.GetConnectionString("DefaultConnection")
                )
            );

            // Controllers
            builder.Services.AddControllers();

            // Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("FrontendPolicy", policy =>
                {
                    policy
                        .WithOrigins(
                            "http://localhost:4200",
                            "http://127.0.0.1:4200"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            var app = builder.Build();

            builder.Services.AddHttpClient();

            // Swagger
            app.UseSwagger();
            app.UseSwaggerUI();

            // CORS
            app.UseCors("FrontendPolicy");

            app.UseAuthorization();

            // Controllers
            app.MapControllers();

            // Test endpoint
            app.MapGet("/", () => "IssueWatchdog API is running!");

            app.Run();
        }
    }
}