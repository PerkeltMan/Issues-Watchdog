using api.DTO;
using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class IssuesController : ControllerBase
    {
        private readonly MyContext _context;

        public IssuesController(MyContext context)
        {
            this._context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Issue>>> GetAll(CancellationToken token)
        {
            var issues = await this._context.Issues
                 .AsNoTracking()
                 .ToListAsync(token);

            return Ok(issues);
        }

        [HttpPost]
        public async Task<ActionResult<Issue>> AddIssue(IssueAdd issue, CancellationToken token)
        {

            var repository = this._context.Repositories
                .SingleOrDefault(x => x.RepositoryName == issue.RepositoryName);

            if (repository == null)
            {
                throw new Exception($"Repository '{issue.RepositoryName}' was not found.");
            }

            var exists = this._context.Issues
                 .Any(i =>
                      i.GithubId == issue.GithubId &&
                      this._context.Repositories.Any(r =>
                        r.Id == i.RepositoryId &&
                        r.RepositoryName == issue.RepositoryName
                 )
            );

            if (exists)
            {
                return Conflict("Issue is already in database");
            }

            Issue newIssue = new Issue
            {
                RepositoryId = repository.Id,
                Severity = issue.Severity,
                Description = issue.Description,
                Resolved = false,
                GithubId = issue.GithubId,
                Title = issue.Title
                
            };

            await this._context.Issues.AddAsync(newIssue, token);
            await this._context.SaveChangesAsync(token);

            return Ok(newIssue);
        }

        // PUT issure resolve status to true
        [HttpPut]
        public async Task<ActionResult<Issue>> ResolveIssue(int id, CancellationToken token)
        {
            Issue? issue = await this._context.Issues.FirstOrDefaultAsync(i => i.Id == id, token);

            if (issue == null)
                return NotFound("Issue was not found");

            if (issue.Resolved)
                return Conflict("Issue already resolved");

            issue.Resolved = true;

            await this._context.SaveChangesAsync(token);

            return Ok(issue);
        }
    }
}