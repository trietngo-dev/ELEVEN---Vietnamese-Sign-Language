using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class SubscriptionPlanRepository(AppDbContext dbContext) : ISubscriptionPlanRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<SubscriptionPlan>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.SubscriptionPlans
            .AsNoTracking()
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.SubscriptionPlans.AsNoTracking().CountAsync(cancellationToken);

    public Task<SubscriptionPlan?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.SubscriptionPlans.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsByCodeAsync(string code, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.SubscriptionPlans.AsNoTracking().Where(x => x.Code == code);
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<SubscriptionPlan> AddAsync(SubscriptionPlan entity, CancellationToken cancellationToken = default)
    {
        _dbContext.SubscriptionPlans.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<SubscriptionPlan> UpdateAsync(SubscriptionPlan entity, CancellationToken cancellationToken = default)
    {
        _dbContext.SubscriptionPlans.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.SubscriptionPlans.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.SubscriptionPlans.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
