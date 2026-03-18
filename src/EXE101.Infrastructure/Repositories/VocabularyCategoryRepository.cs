using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class VocabularyCategoryRepository(AppDbContext dbContext) : IVocabularyCategoryRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<VocabularyCategory>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.VocabularyCategories
            .AsNoTracking()
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.VocabularyCategories.AsNoTracking().CountAsync(cancellationToken);

    public Task<VocabularyCategory?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.VocabularyCategories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsBySlugAsync(string slug, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.VocabularyCategories.AsNoTracking().Where(x => x.Slug == slug);
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<VocabularyCategory> AddAsync(VocabularyCategory entity, CancellationToken cancellationToken = default)
    {
        _dbContext.VocabularyCategories.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<VocabularyCategory> UpdateAsync(VocabularyCategory entity, CancellationToken cancellationToken = default)
    {
        _dbContext.VocabularyCategories.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.VocabularyCategories.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.VocabularyCategories.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
