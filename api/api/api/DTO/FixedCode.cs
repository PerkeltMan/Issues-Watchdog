using System.ComponentModel.DataAnnotations;

namespace api.DTO
{
    public class FixedCode
    {
        [Required]
        public string OldCode { get; set; } = string.Empty;

        [Required]
        public string NewCode { get; set;} = string.Empty;

        [Required] 
        public string FilePath { get; set;} = string.Empty;

        [Required]
        public string FixDescription { get; set;} = string.Empty;

    }
}
