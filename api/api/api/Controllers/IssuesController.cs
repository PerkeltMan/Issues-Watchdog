using System.Runtime.InteropServices;
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
        private readonly HttpClient httpClient;

        public IssuesController(MyContext context, HttpClient client)
        {
            this._context = context;
            this.httpClient = client;
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


        [HttpPost("createFix")]
        public async Task<ActionResult<FixedCode>> GenerateIssueFix(
    [FromBody] CreateFixRequest request,
    CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest("Description is required.");
            }

            var n8nPayload = new
            {
                issueDescription = request.Description
            };

            var response = await httpClient.PostAsJsonAsync(
                "https://karelmay.app.n8n.cloud/webhook/issue-watchdog",
                n8nPayload,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(cancellationToken);

                return StatusCode(
                    (int)response.StatusCode,
                    $"n8n workflow failed: {error}");
            }

            var fixedCode = await response.Content.ReadFromJsonAsync<FixedCode>(
                cancellationToken: cancellationToken);

            if (fixedCode is null)
            {
                return StatusCode(
                    StatusCodes.Status502BadGateway,
                    "n8n returned an empty or invalid response.");
            }

            return Ok(fixedCode);
        }


        [HttpPost("commitFix")]
        public async Task<ActionResult<CommitFixResponse>> CommitFix(
    [FromBody] CommitFixRequest commit,
    CancellationToken token)
        {
            if (string.IsNullOrWhiteSpace(commit.FilePath))
            {
                return BadRequest("FilePath is required.");
            }

            if (string.IsNullOrWhiteSpace(commit.FixedCode))
            {
                return BadRequest("FixedCode is required.");
            }

            var n8nPayload = new
            {
                filePath = commit.FilePath,
                fixedCode = commit.FixedCode
            };

            var response = await this.httpClient.PostAsJsonAsync(
                "http://YOUR-N8N-SERVER/webhook/commit-fix",
                n8nPayload,
                token);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(token);

                return StatusCode(
                    (int)response.StatusCode,
                    $"n8n commit workflow failed: {error}");
            }

            var result = await response.Content.ReadFromJsonAsync<CommitFixResponse>(
                cancellationToken: token);

            if (result is null)
            {
                return StatusCode(
                    StatusCodes.Status502BadGateway,
                    "n8n returned an empty or invalid response.");
            }

            return Ok(result);
        }

    }
}