using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class PracticeAttemptRepository(AppDbContext dbContext) : IPracticeAttemptRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<PracticeAttempt>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.PracticeAttempts
            .AsNoTracking()
            .OrderBy(x => x.PracticeSessionId)
            .ThenBy(x => x.SortOrder)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.PracticeAttempts.AsNoTracking().CountAsync(cancellationToken);

    public Task<PracticeAttempt?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.PracticeAttempts.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<PracticeAttempt> AddAsync(PracticeAttempt entity, CancellationToken cancellationToken = default)
    {
        _dbContext.PracticeAttempts.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<PracticeAttempt> UpdateAsync(PracticeAttempt entity, CancellationToken cancellationToken = default)
    {
        _dbContext.PracticeAttempts.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.PracticeAttempts.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.PracticeAttempts.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
