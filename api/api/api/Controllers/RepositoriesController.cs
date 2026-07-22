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

        [HttpGet]
        public async Task<ActionResult<List<Repository>>> GetAll(CancellationToken token)
        {
           var repositories = await this._context.Repositories
                .AsNoTracking()
                .ToListAsync(token);

            return Ok(repositories);
        }

    }
}
