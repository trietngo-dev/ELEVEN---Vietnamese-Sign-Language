using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class FeedbackCategoryRepository(AppDbContext dbContext) : IFeedbackCategoryRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<FeedbackCategory>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.FeedbackCategories
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.FeedbackCategories.AsNoTracking().CountAsync(cancellationToken);

    public Task<FeedbackCategory?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.FeedbackCategories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<FeedbackCategory> AddAsync(FeedbackCategory entity, CancellationToken cancellationToken = default)
    {
        _dbContext.FeedbackCategories.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<FeedbackCategory> UpdateAsync(FeedbackCategory entity, CancellationToken cancellationToken = default)
    {
        _dbContext.FeedbackCategories.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.FeedbackCategories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.FeedbackCategories.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
