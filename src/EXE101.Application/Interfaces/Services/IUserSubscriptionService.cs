using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserSubscriptions;

namespace EXE101.Application.Interfaces.Services;

public interface IUserSubscriptionService
{
    Task<PagedResult<UserSubscriptionResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<UserSubscriptionResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<UserSubscriptionResponse> CreateAsync(CreateUserSubscriptionRequest request, CancellationToken cancellationToken = default);
    Task<UserSubscriptionResponse?> UpdateAsync(long id, UpdateUserSubscriptionRequest request, CancellationToken cancellationToken = default);
    Task<UserSubscriptionResponse?> GetActiveByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
