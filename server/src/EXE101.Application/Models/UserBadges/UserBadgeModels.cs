namespace EXE101.Application.Models.UserBadges;

public sealed class CreateUserBadgeRequest
{
    public long UserId { get; set; }
    public long BadgeId { get; set; }
    public DateTime AwardedAt { get; set; }
}

public sealed class UpdateUserBadgeRequest
{
    public long BadgeId { get; set; }
    public DateTime AwardedAt { get; set; }
}

public sealed class UserBadgeResponse
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long BadgeId { get; set; }
    public DateTime AwardedAt { get; set; }
}
