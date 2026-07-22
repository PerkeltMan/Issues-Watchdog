using System.ComponentModel.DataAnnotations;

namespace api.DTO
{
    public class RepositoryAdd
    {
        [Required]
        public string RepositoryUrl { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
