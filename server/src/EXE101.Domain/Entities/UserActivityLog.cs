namespace EXE101.Domain.Entities;

public sealed class UserActivityLog
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public long? EntityId { get; set; }
    public string? MetadataJson { get; set; }
    public DateTime CreatedAt { get; set; }
}
