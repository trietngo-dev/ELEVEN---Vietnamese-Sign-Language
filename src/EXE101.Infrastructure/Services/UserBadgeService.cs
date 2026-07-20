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

    public async Task CheckAndAwardBadgesAsync(long userId, CancellationToken cancellationToken = default)
    {
        var profile = await _dbContext.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (profile is null) return;

        var badges = await _dbContext.Badges.ToListAsync(cancellationToken);
        if (!badges.Any()) return;

        var userBadges = await _dbContext.UserBadges.Where(ub => ub.UserId == userId).ToListAsync(cancellationToken);

        async Task AwardBadgeIfEligible(string badgeCode)
        {
            var badgeObj = badges.FirstOrDefault(b => b.Code.Equals(badgeCode, StringComparison.OrdinalIgnoreCase));
            if (badgeObj is null) return;

            var alreadyHas = userBadges.Any(ub => ub.BadgeId == badgeObj.Id);
            if (!alreadyHas)
            {
                var newAward = new UserBadge
                {
                    UserId = userId,
                    BadgeId = badgeObj.Id,
                    AwardedAt = DateTime.UtcNow
                };
                _dbContext.UserBadges.Add(newAward);
                userBadges.Add(newAward);
            }
        }

        // 1. Khởi đầu (START): Account exists
        await AwardBadgeIfEligible("START");

        // 2. Chuyên cần (STREAK_7D): Login streak >= 7
        if (profile.CurrentStreakDays >= 7)
        {
            await AwardBadgeIfEligible("STREAK_7D");
        }

        // 3. Kỷ lục streak
        if (profile.CurrentStreakDays >= 3)
        {
            await AwardBadgeIfEligible("STREAK_3D");
        }
        if (profile.CurrentStreakDays >= 5)
        {
            await AwardBadgeIfEligible("STREAK_5D");
        }
        if (profile.CurrentStreakDays >= 30)
        {
            await AwardBadgeIfEligible("STREAK_30D");
        }
        if (profile.CurrentStreakDays >= 365)
        {
            await AwardBadgeIfEligible("STREAK_365D");
        }

        // 4. Quyết tâm (DETERMINED): Studied over 3 courses
        var completedCoursesCount = await _dbContext.Enrollments
            .Where(e => e.UserId == userId && e.Status == EXE101.Domain.Enums.EnrollmentStatus.Completed)
            .CountAsync(cancellationToken);

        if (completedCoursesCount >= 3)
        {
            await AwardBadgeIfEligible("DETERMINED");
        }

        // 5. Nhà sưu tập (COLLECTOR): Owns over 5 badges
        var earnedCount = userBadges.Count;
        if (earnedCount >= 5)
        {
            await AwardBadgeIfEligible("COLLECTOR");
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

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
