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

            var repositoryExists = await _context.Repositories
                .AnyAsync(r => r.Id == issue.RepositoryId, token);

            if (!repositoryExists)
            {
                return NotFound("Repository was not found.");
            }

            // Check for duplicate issue
            var issueExists = await _context.Issues
                .AnyAsync(i =>
                    i.RepositoryId == issue.RepositoryId &&
                    i.GithubId == issue.GithubId,
                    token);

            if (issueExists)
            {
                return Conflict("This issue already exists.");
            }

            Issue newIssue = new Issue
            {
                RepositoryId = issue.RepositoryId,
                Severity = issue.Severity,
                Description = issue.Description,
                Resolved = issue.Resolved,
                GithubId = issue.GithubId
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