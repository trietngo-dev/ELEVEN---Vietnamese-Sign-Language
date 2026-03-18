using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class UserSubscriptionRepository(AppDbContext dbContext) : IUserSubscriptionRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<UserSubscription>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.UserSubscriptions
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.UserSubscriptions.AsNoTracking().CountAsync(cancellationToken);

    public Task<UserSubscription?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.UserSubscriptions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<UserSubscription> AddAsync(UserSubscription entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserSubscriptions.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<UserSubscription> UpdateAsync(UserSubscription entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserSubscriptions.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.UserSubscriptions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.UserSubscriptions.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
