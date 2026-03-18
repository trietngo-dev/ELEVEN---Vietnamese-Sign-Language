using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class FeedbackRepository(AppDbContext dbContext) : IFeedbackRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<Feedback>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.Feedbacks
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.Feedbacks.AsNoTracking().CountAsync(cancellationToken);

    public Task<Feedback?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.Feedbacks.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<Feedback> AddAsync(Feedback entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Feedbacks.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<Feedback> UpdateAsync(Feedback entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Feedbacks.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Feedbacks.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.Feedbacks.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
