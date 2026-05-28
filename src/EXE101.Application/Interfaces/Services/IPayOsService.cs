namespace EXE101.Application.Interfaces.Services;

public interface IPayOsService
{
    Task<string> CreatePaymentLinkAsync(long orderCode, long amount, string description, CancellationToken cancellationToken);
    bool VerifyWebhookSignature(string webhookBodyJson);
    Task<string?> GetPaymentStatusAsync(long orderCode, CancellationToken cancellationToken);
}
