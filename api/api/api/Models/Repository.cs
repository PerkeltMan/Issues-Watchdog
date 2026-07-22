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
        [Column("repository_url")]
        public string RepositoryUrl { get; set; } = string.Empty;

       
        [Column("added_at")]
        public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
