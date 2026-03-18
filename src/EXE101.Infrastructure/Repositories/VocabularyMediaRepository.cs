using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class VocabularyMediaRepository(AppDbContext dbContext) : IVocabularyMediaRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<VocabularyMedia>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.VocabularyMedias
            .AsNoTracking()
            .OrderBy(x => x.VocabularyId)
            .ThenBy(x => x.SortOrder)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.VocabularyMedias.AsNoTracking().CountAsync(cancellationToken);

    public Task<VocabularyMedia?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.VocabularyMedias.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsByVocabularyAndMediaAsync(long vocabularyId, long mediaId, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.VocabularyMedias
            .AsNoTracking()
            .Where(x => x.VocabularyId == vocabularyId && x.MediaId == mediaId);

        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<VocabularyMedia> AddAsync(VocabularyMedia entity, CancellationToken cancellationToken = default)
    {
        _dbContext.VocabularyMedias.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<VocabularyMedia> UpdateAsync(VocabularyMedia entity, CancellationToken cancellationToken = default)
    {
        _dbContext.VocabularyMedias.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.VocabularyMedias.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.VocabularyMedias.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
