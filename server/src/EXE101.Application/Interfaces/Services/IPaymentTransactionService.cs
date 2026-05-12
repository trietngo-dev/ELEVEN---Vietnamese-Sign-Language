using EXE101.Application.Models.Common;
using EXE101.Application.Models.PaymentTransactions;

namespace EXE101.Application.Interfaces.Services;

public interface IPaymentTransactionService
{
    Task<PagedResult<PaymentTransactionResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<PaymentTransactionResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<PaymentTransactionResponse> CreateAsync(CreatePaymentTransactionRequest request, CancellationToken cancellationToken = default);
    Task<PaymentTransactionResponse?> UpdateAsync(long id, UpdatePaymentTransactionRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
