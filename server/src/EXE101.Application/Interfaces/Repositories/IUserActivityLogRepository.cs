using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IUserActivityLogRepository
{
    Task<IReadOnlyList<UserActivityLog>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<UserActivityLog?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<UserActivityLog> AddAsync(UserActivityLog entity, CancellationToken cancellationToken = default);
}
