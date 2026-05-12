using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class LessonVocabularyRepository(AppDbContext dbContext) : ILessonVocabularyRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<LessonVocabulary>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.LessonVocabularies
            .AsNoTracking()
            .OrderBy(x => x.LessonId)
            .ThenBy(x => x.SortOrder)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.LessonVocabularies.AsNoTracking().CountAsync(cancellationToken);

    public Task<LessonVocabulary?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.LessonVocabularies.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsByLessonAndVocabularyAsync(long lessonId, long vocabularyId, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.LessonVocabularies
            .AsNoTracking()
            .Where(x => x.LessonId == lessonId && x.VocabularyId == vocabularyId);

        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<LessonVocabulary> AddAsync(LessonVocabulary entity, CancellationToken cancellationToken = default)
    {
        _dbContext.LessonVocabularies.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<LessonVocabulary> UpdateAsync(LessonVocabulary entity, CancellationToken cancellationToken = default)
    {
        _dbContext.LessonVocabularies.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.LessonVocabularies.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.LessonVocabularies.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
