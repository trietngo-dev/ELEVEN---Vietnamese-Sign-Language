using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface ISubscriptionPlanRepository
{
    Task<IReadOnlyList<SubscriptionPlan>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<SubscriptionPlan?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCodeAsync(string code, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<SubscriptionPlan> AddAsync(SubscriptionPlan entity, CancellationToken cancellationToken = default);
    Task<SubscriptionPlan> UpdateAsync(SubscriptionPlan entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
