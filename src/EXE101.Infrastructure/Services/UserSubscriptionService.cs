using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserSubscriptions;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class UserSubscriptionService(
    IUserSubscriptionRepository repository,
    AppDbContext dbContext) : IUserSubscriptionService
{
    private readonly IUserSubscriptionRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<UserSubscriptionResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);

        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<UserSubscriptionResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<UserSubscriptionResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<UserSubscriptionResponse> CreateAsync(CreateUserSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.PlanId, cancellationToken);

        var entity = new UserSubscription
        {
            UserId = request.UserId,
            PlanId = request.PlanId,
            Status = request.Status,
            StartAt = request.StartAt,
            EndAt = request.EndAt,
            AutoRenew = request.AutoRenew,
            Source = request.Source,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<UserSubscriptionResponse?> UpdateAsync(long id, UpdateUserSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await ValidateDependenciesAsync(entity.UserId, request.PlanId, cancellationToken);

        entity.PlanId = request.PlanId;
        entity.Status = request.Status;
        entity.StartAt = request.StartAt;
        entity.EndAt = request.EndAt;
        entity.AutoRenew = request.AutoRenew;
        entity.Source = request.Source;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public async Task<UserSubscriptionResponse?> GetActiveByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.UserSubscriptions
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Status == SubscriptionStatus.Active, cancellationToken);

        return entity is null ? null : Map(entity);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long userId, long planId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var planExists = await _dbContext.SubscriptionPlans.AsNoTracking().AnyAsync(x => x.Id == planId, cancellationToken);
        if (!planExists)
        {
            throw new InvalidOperationException("Subscription plan does not exist.");
        }
    }

    private static UserSubscriptionResponse Map(UserSubscription entity)
    {
        return new UserSubscriptionResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            PlanId = entity.PlanId,
            Status = entity.Status,
            StartAt = entity.StartAt,
            EndAt = entity.EndAt,
            AutoRenew = entity.AutoRenew,
            Source = entity.Source,
            CreatedAt = entity.CreatedAt
        };
    }
}
