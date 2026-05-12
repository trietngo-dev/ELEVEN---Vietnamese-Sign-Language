using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IPaymentTransactionRepository
{
    Task<IReadOnlyList<PaymentTransaction>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<PaymentTransaction?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<PaymentTransaction> AddAsync(PaymentTransaction entity, CancellationToken cancellationToken = default);
    Task<PaymentTransaction> UpdateAsync(PaymentTransaction entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
