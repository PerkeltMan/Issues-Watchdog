using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.DTO
{
    public class IssueAdd
    {
        [Required]
        public int RepositoryId { get; set; }

        [Required]
        public string Severity { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public bool Resolved { get; set; } = false;

        [Required]
        public int GithubId { get; set; }
    }
}
