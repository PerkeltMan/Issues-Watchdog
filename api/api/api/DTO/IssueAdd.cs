using System.ComponentModel.DataAnnotations;

namespace api.DTO
{
    public class IssueAdd
    {

        [Required]
        public string RepositoryName { get; set; } = string.Empty;

        [Required]
        public string Severity { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int GithubId { get; set; }
    }
}
