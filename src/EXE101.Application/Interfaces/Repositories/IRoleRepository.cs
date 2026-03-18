using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IRoleRepository
{
    Task<IReadOnlyList<Role>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<Role?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCodeAsync(string code, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<Role> AddAsync(Role entity, CancellationToken cancellationToken = default);
    Task<Role> UpdateAsync(Role entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
