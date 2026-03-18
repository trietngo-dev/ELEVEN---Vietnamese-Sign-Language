using EXE101.Domain.Enums;

namespace EXE101.Application.Models.UserSubscriptions;

public sealed class CreateUserSubscriptionRequest
{
    public long UserId { get; set; }
    public long PlanId { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;
    public DateTime StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public bool AutoRenew { get; set; }
    public string? Source { get; set; }
}

public sealed class UpdateUserSubscriptionRequest
{
    public long PlanId { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public bool AutoRenew { get; set; }
    public string? Source { get; set; }
}

public sealed class UserSubscriptionResponse
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
