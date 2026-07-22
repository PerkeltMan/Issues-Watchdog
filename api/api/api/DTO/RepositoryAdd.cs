using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.DTO
{
    public class RepositoryAdd
    {
        [Required]
        [Column("repo_owner")]
        public string RepositoryOwner { get; set; } = string.Empty;

        [Required]
        [Column("repo_name")]
        public string RepositoryName { get; set; } = string.Empty;
    }
}
