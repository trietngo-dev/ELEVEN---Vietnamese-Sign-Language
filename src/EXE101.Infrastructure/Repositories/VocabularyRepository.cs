using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class VocabularyRepository(AppDbContext dbContext) : IVocabularyRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<Vocabulary>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.Vocabularies
            .AsNoTracking()
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.Vocabularies.AsNoTracking().CountAsync(cancellationToken);

    public Task<Vocabulary?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.Vocabularies.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<Vocabulary> AddAsync(Vocabulary entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Vocabularies.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<Vocabulary> UpdateAsync(Vocabulary entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Vocabularies.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Vocabularies.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.Vocabularies.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
