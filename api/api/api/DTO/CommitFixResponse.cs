namespace api.DTO
{
    public class CommitFixResponse
    {
        public bool Success { get; set; }
        public string CommitSha { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
