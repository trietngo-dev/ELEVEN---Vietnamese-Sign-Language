using EXE101.Application.Models.Badges;
using EXE101.Application.Models.Common;

namespace EXE101.Application.Interfaces.Services;

public interface IBadgeService
{
    Task<PagedResult<BadgeResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<BadgeResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<BadgeResponse> CreateAsync(CreateBadgeRequest request, CancellationToken cancellationToken = default);
    Task<BadgeResponse?> UpdateAsync(long id, UpdateBadgeRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
