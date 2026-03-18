using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserActivityLogs;

namespace EXE101.Application.Interfaces.Services;

public interface IUserActivityLogService
{
    Task<PagedResult<UserActivityLogResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<UserActivityLogResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<UserActivityLogResponse> CreateAsync(CreateUserActivityLogRequest request, CancellationToken cancellationToken = default);
}
