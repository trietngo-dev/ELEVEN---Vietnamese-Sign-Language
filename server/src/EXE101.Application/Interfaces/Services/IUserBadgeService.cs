using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserBadges;

namespace EXE101.Application.Interfaces.Services;

public interface IUserBadgeService
{
    Task<PagedResult<UserBadgeResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<UserBadgeResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<UserBadgeResponse> CreateAsync(CreateUserBadgeRequest request, CancellationToken cancellationToken = default);
    Task<UserBadgeResponse?> UpdateAsync(long id, UpdateUserBadgeRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
