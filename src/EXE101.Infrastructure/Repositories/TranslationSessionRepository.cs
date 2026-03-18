using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class TranslationSessionRepository(AppDbContext dbContext) : ITranslationSessionRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<TranslationSession>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.TranslationSessions
            .AsNoTracking()
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.TranslationSessions.AsNoTracking().CountAsync(cancellationToken);

    public Task<TranslationSession?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.TranslationSessions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<TranslationSession> AddAsync(TranslationSession entity, CancellationToken cancellationToken = default)
    {
        _dbContext.TranslationSessions.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<TranslationSession> UpdateAsync(TranslationSession entity, CancellationToken cancellationToken = default)
    {
        _dbContext.TranslationSessions.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.TranslationSessions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.TranslationSessions.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
