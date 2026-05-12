using EXE101.Domain.Enums;

namespace EXE101.Application.Models.PaymentTransactions;

public sealed class CreatePaymentTransactionRequest
{
    public long UserId { get; set; }
    public long? UserSubscriptionId { get; set; }
    public long AmountVnd { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentProvider { get; set; }
    public string? ProviderTransactionRef { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime? PaidAt { get; set; }
}

public sealed class UpdatePaymentTransactionRequest
{
    public long? UserSubscriptionId { get; set; }
    public long AmountVnd { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? PaymentProvider { get; set; }
    public string? ProviderTransactionRef { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime? PaidAt { get; set; }
}

public sealed class PaymentTransactionResponse
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
