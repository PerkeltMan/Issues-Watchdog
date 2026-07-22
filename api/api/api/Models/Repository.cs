using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Models
{
    [Table("repositories")]
    public class Repository
    {

        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("repo_owner")]
        public string RepositoryOwner { get; set; } = string.Empty;


        [Required]
        [Column("repo_name")]
        public string RepositoryName { get; set; } = string.Empty;

        [Required]
        [Column("added_at")]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
