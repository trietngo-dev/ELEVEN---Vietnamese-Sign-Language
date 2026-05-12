using EXE101.Application.Models.Common;
using EXE101.Application.Models.Roles;

namespace EXE101.Application.Interfaces.Services;

public interface IRoleService
{
    Task<PagedResult<RoleResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<RoleResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<RoleResponse> CreateAsync(CreateRoleRequest request, CancellationToken cancellationToken = default);
    Task<RoleResponse?> UpdateAsync(long id, UpdateRoleRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
