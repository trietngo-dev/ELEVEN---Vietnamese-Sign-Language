using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IUserSubscriptionRepository
{
    Task<IReadOnlyList<UserSubscription>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<UserSubscription?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<UserSubscription> AddAsync(UserSubscription entity, CancellationToken cancellationToken = default);
    Task<UserSubscription> UpdateAsync(UserSubscription entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
