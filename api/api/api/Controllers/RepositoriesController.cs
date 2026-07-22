using api.DTO;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class RepositoriesController : ControllerBase
    {

        private readonly MyContext _context;

        public RepositoriesController(MyContext context)
        {
            this._context = context;
        }

        // GET all repositories
        [HttpGet]
        public async Task<ActionResult<List<Repository>>> GetAll(CancellationToken token)
        {
           var repositories = await this._context.Repositories
                .AsNoTracking()
                .ToListAsync(token);

            return Ok(repositories);
        }

        // POST new repository
        [HttpPost]
        public async Task<ActionResult<Repository>> AddRepository(RepositoryAdd repository, CancellationToken token)
        {
            if (string.IsNullOrWhiteSpace(repository.RepositoryOwner) || string.IsNullOrWhiteSpace(repository.RepositoryName))
            {
                return BadRequest("Repository URL is required.");
            }

            string repositoryName = repository.RepositoryName.Trim();
            string repositoryOwner = repository.RepositoryOwner.Trim();


            Repository newRepository = new Repository
            {
                RepositoryName = repository.RepositoryName,
                RepositoryOwner = repository.RepositoryOwner,
                CreatedAt = DateTime.UtcNow
            };

            var exists = await _context.Repositories
                .AnyAsync(r =>
                    r.RepositoryName == repositoryName &&
                    r.RepositoryOwner == repositoryOwner,
                    token);

            if (exists)
            {
                return Conflict("Repository already exists.");
            }

            await this._context.Repositories.AddAsync(newRepository, token);
            await this._context.SaveChangesAsync(token);

            return Ok(newRepository);
        }
    }
}
