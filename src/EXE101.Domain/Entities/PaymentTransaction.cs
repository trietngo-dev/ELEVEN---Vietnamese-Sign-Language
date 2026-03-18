using EXE101.Domain.Enums;

namespace EXE101.Domain.Entities;

public sealed class PaymentTransaction
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long? UserSubscriptionId { get; set; }
    public long AmountVnd { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentProvider { get; set; }
    public string? ProviderTransactionRef { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
