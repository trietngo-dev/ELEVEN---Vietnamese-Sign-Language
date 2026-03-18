using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class TranslationSegmentRepository(AppDbContext dbContext) : ITranslationSegmentRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<TranslationSegment>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.TranslationSegments
            .AsNoTracking()
            .OrderBy(x => x.SessionId)
            .ThenBy(x => x.SegmentOrder)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.TranslationSegments.AsNoTracking().CountAsync(cancellationToken);

    public Task<TranslationSegment?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.TranslationSegments.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<TranslationSegment> AddAsync(TranslationSegment entity, CancellationToken cancellationToken = default)
    {
        _dbContext.TranslationSegments.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<TranslationSegment> UpdateAsync(TranslationSegment entity, CancellationToken cancellationToken = default)
    {
        _dbContext.TranslationSegments.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.TranslationSegments.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.TranslationSegments.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
