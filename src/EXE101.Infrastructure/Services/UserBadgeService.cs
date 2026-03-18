using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserBadges;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class UserBadgeService(
    IUserBadgeRepository repository,
    AppDbContext dbContext) : IUserBadgeService
{
    private readonly IUserBadgeRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<UserBadgeResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<UserBadgeResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<UserBadgeResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<UserBadgeResponse> CreateAsync(CreateUserBadgeRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.BadgeId, cancellationToken);

        var exists = await _repository.ExistsByUserAndBadgeAsync(request.UserId, request.BadgeId, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("User badge already exists.");
        }

        var entity = new UserBadge
        {
            UserId = request.UserId,
            BadgeId = request.BadgeId,
            AwardedAt = request.AwardedAt
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<UserBadgeResponse?> UpdateAsync(long id, UpdateUserBadgeRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await ValidateDependenciesAsync(entity.UserId, request.BadgeId, cancellationToken);

        var exists = await _repository.ExistsByUserAndBadgeAsync(entity.UserId, request.BadgeId, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("User badge already exists.");
        }

        entity.BadgeId = request.BadgeId;
        entity.AwardedAt = request.AwardedAt;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long userId, long badgeId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var badgeExists = await _dbContext.Badges.AsNoTracking().AnyAsync(x => x.Id == badgeId, cancellationToken);
        if (!badgeExists)
        {
            throw new InvalidOperationException("Badge does not exist.");
        }
    }

    private static UserBadgeResponse Map(UserBadge entity)
    {
        return new UserBadgeResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            BadgeId = entity.BadgeId,
            AwardedAt = entity.AwardedAt
        };
    }
}
