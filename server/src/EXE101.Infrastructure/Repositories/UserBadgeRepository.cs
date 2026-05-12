using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class UserBadgeRepository(AppDbContext dbContext) : IUserBadgeRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<UserBadge>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.UserBadges
            .AsNoTracking()
            .OrderByDescending(x => x.AwardedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.UserBadges.AsNoTracking().CountAsync(cancellationToken);

    public Task<UserBadge?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.UserBadges.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsByUserAndBadgeAsync(long userId, long badgeId, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.UserBadges.AsNoTracking().Where(x => x.UserId == userId && x.BadgeId == badgeId);
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<UserBadge> AddAsync(UserBadge entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserBadges.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<UserBadge> UpdateAsync(UserBadge entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserBadges.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.UserBadges.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.UserBadges.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
