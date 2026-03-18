using EXE101.Application.Models.AdminActionLogs;
using EXE101.Application.Models.Common;

namespace EXE101.Application.Interfaces.Services;

public interface IAdminActionLogService
{
    Task<PagedResult<AdminActionLogResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<AdminActionLogResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<AdminActionLogResponse> CreateAsync(CreateAdminActionLogRequest request, CancellationToken cancellationToken = default);
}
