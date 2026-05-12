using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class PracticeSessionRepository(AppDbContext dbContext) : IPracticeSessionRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<PracticeSession>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.PracticeSessions
            .AsNoTracking()
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.PracticeSessions.AsNoTracking().CountAsync(cancellationToken);

    public Task<PracticeSession?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.PracticeSessions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<PracticeSession> AddAsync(PracticeSession entity, CancellationToken cancellationToken = default)
    {
        _dbContext.PracticeSessions.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<PracticeSession> UpdateAsync(PracticeSession entity, CancellationToken cancellationToken = default)
    {
        _dbContext.PracticeSessions.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.PracticeSessions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.PracticeSessions.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
