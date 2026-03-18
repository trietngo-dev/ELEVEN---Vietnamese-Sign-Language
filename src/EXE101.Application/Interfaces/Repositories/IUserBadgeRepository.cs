using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IUserBadgeRepository
{
    Task<IReadOnlyList<UserBadge>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<UserBadge?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByUserAndBadgeAsync(long userId, long badgeId, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<UserBadge> AddAsync(UserBadge entity, CancellationToken cancellationToken = default);
    Task<UserBadge> UpdateAsync(UserBadge entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
