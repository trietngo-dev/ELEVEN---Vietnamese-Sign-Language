using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IBadgeRepository
{
    Task<IReadOnlyList<Badge>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<Badge?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCodeAsync(string code, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<Badge> AddAsync(Badge entity, CancellationToken cancellationToken = default);
    Task<Badge> UpdateAsync(Badge entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
