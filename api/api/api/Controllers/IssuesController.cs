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
    }
}