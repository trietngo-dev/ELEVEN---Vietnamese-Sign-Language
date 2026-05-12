namespace EXE101.Domain.Entities;

public sealed class UserBadge
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long BadgeId { get; set; }
    public DateTime AwardedAt { get; set; }
}
