using EXE101.Application.Models.Common;
using EXE101.Application.Models.SubscriptionPlans;

namespace EXE101.Application.Interfaces.Services;

public interface ISubscriptionPlanService
{
    Task<PagedResult<SubscriptionPlanResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<SubscriptionPlanResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<SubscriptionPlanResponse> CreateAsync(CreateSubscriptionPlanRequest request, CancellationToken cancellationToken = default);
    Task<SubscriptionPlanResponse?> UpdateAsync(long id, UpdateSubscriptionPlanRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
