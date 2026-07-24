namespace api.DTO
{
    public class CommitFixRequest
    {
        public string FilePath { get; set; } = string.Empty;
        public string FixedCode {  get; set; } = string.Empty;
    }
}
