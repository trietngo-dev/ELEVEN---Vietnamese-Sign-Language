using EXE101.Domain.Enums;

namespace EXE101.Application.Models.Badges;

public sealed class CreateBadgeRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BadgeType BadgeType { get; set; }
    public long? IconMediaId { get; set; }
    public string? CriteriaJson { get; set; }
}

public sealed class UpdateBadgeRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BadgeType BadgeType { get; set; }
    public long? IconMediaId { get; set; }
    public string? CriteriaJson { get; set; }
}

public sealed class BadgeResponse
{
    public long Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public BadgeType BadgeType { get; set; }
    public long? IconMediaId { get; set; }
    public string? CriteriaJson { get; set; }
    public DateTime CreatedAt { get; set; }
}
