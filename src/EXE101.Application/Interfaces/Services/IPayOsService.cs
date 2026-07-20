namespace EXE101.Application.Interfaces.Services;

public interface IPayOsService
{
    Task<string> CreatePaymentLinkAsync(long orderCode, long amount, string description, string? returnUrl = null, string? cancelUrl = null, CancellationToken cancellationToken = default);
    bool VerifyWebhookSignature(string webhookBodyJson);
    Task<string?> GetPaymentStatusAsync(long orderCode, CancellationToken cancellationToken);
}
