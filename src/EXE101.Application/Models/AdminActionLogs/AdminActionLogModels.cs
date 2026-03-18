namespace EXE101.Application.Models.AdminActionLogs;

public sealed class CreateAdminActionLogRequest
{
    public long AdminUserId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public long? EntityId { get; set; }
    public string? Description { get; set; }
}

public sealed class AdminActionLogResponse
{
    public long Id { get; set; }
    public long AdminUserId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public long? EntityId { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}
