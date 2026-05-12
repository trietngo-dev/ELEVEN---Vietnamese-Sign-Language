using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.SubscriptionPlans;
using EXE101.Domain.Entities;

namespace EXE101.Infrastructure.Services;

public sealed class SubscriptionPlanService(ISubscriptionPlanRepository repository) : ISubscriptionPlanService
{
    private readonly ISubscriptionPlanRepository _repository = repository;

    public async Task<PagedResult<SubscriptionPlanResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);

        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<SubscriptionPlanResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<SubscriptionPlanResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<SubscriptionPlanResponse> CreateAsync(CreateSubscriptionPlanRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequest(request.Code, request.Name, request.BillingCycle, request.CourseAccessScope, request.PriceVnd, request.DailyTranslationLimit, request.AiPracticeLimit, request.DisplayOrder);

        var code = request.Code.Trim().ToUpperInvariant();
        var exists = await _repository.ExistsByCodeAsync(code, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Subscription plan code already exists.");
        }

        var entity = new SubscriptionPlan
        {
            Code = code,
            Name = request.Name.Trim(),
            BillingCycle = request.BillingCycle.Trim().ToLowerInvariant(),
            PriceVnd = request.PriceVnd,
            DailyTranslationLimit = request.DailyTranslationLimit,
            AiPracticeLimit = request.AiPracticeLimit,
            CourseAccessScope = request.CourseAccessScope.Trim().ToLowerInvariant(),
            CanSaveHistory = request.CanSaveHistory,
            CertificateEnabled = request.CertificateEnabled,
            PrioritySupport = request.PrioritySupport,
            IsActive = request.IsActive,
            DisplayOrder = request.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<SubscriptionPlanResponse?> UpdateAsync(long id, UpdateSubscriptionPlanRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateRequest(request.Code, request.Name, request.BillingCycle, request.CourseAccessScope, request.PriceVnd, request.DailyTranslationLimit, request.AiPracticeLimit, request.DisplayOrder);

        var code = request.Code.Trim().ToUpperInvariant();
        var exists = await _repository.ExistsByCodeAsync(code, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Subscription plan code already exists.");
        }

        entity.Code = code;
        entity.Name = request.Name.Trim();
        entity.BillingCycle = request.BillingCycle.Trim().ToLowerInvariant();
        entity.PriceVnd = request.PriceVnd;
        entity.DailyTranslationLimit = request.DailyTranslationLimit;
        entity.AiPracticeLimit = request.AiPracticeLimit;
        entity.CourseAccessScope = request.CourseAccessScope.Trim().ToLowerInvariant();
        entity.CanSaveHistory = request.CanSaveHistory;
        entity.CertificateEnabled = request.CertificateEnabled;
        entity.PrioritySupport = request.PrioritySupport;
        entity.IsActive = request.IsActive;
        entity.DisplayOrder = request.DisplayOrder;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private static void ValidateRequest(string code, string name, string billingCycle, string courseAccessScope, long priceVnd, int dailyTranslationLimit, int aiPracticeLimit, int displayOrder)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(billingCycle) || string.IsNullOrWhiteSpace(courseAccessScope))
        {
            throw new InvalidOperationException("Code, Name, BillingCycle and CourseAccessScope are required.");
        }

        if (priceVnd < 0 || dailyTranslationLimit < 0 || aiPracticeLimit < 0 || displayOrder < 0)
        {
            throw new InvalidOperationException("Numeric fields must be greater than or equal to zero.");
        }
    }

    private static SubscriptionPlanResponse Map(SubscriptionPlan entity)
    {
        return new SubscriptionPlanResponse
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            BillingCycle = entity.BillingCycle,
            PriceVnd = entity.PriceVnd,
            DailyTranslationLimit = entity.DailyTranslationLimit,
            AiPracticeLimit = entity.AiPracticeLimit,
            CourseAccessScope = entity.CourseAccessScope,
            CanSaveHistory = entity.CanSaveHistory,
            CertificateEnabled = entity.CertificateEnabled,
            PrioritySupport = entity.PrioritySupport,
            IsActive = entity.IsActive,
            DisplayOrder = entity.DisplayOrder,
            CreatedAt = entity.CreatedAt
        };
    }
}
