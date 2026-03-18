using EXE101.Domain.Enums;

namespace EXE101.Domain.Entities;

public sealed class UserSubscription
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long PlanId { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public bool AutoRenew { get; set; }
    public string? Source { get; set; }
    public DateTime CreatedAt { get; set; }
}
