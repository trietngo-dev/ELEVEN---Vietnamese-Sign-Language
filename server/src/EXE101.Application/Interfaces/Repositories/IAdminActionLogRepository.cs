using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IAdminActionLogRepository
{
    Task<IReadOnlyList<AdminActionLog>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<AdminActionLog?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<AdminActionLog> AddAsync(AdminActionLog entity, CancellationToken cancellationToken = default);
}
