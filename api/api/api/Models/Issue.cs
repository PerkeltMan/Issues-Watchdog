using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("issues")]
    public class Issue
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("repo_id")]
        [ForeignKey("Repository")]
        public int RepositoryId { get; set; }

        [Required]
        [Column("severity")]
        public string Severity { get; set; } = string.Empty;

        [Required]
        [Column("ai_description")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column("resolved")]
        public bool Resolved { get; set; } = false;

        [Required]
        [Column("github_id")]
        public int GithubId { get; set; }
    }
}
