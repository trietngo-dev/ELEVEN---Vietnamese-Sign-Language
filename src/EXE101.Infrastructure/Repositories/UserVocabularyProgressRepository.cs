using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class UserVocabularyProgressRepository(AppDbContext dbContext) : IUserVocabularyProgressRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<UserVocabularyProgress>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.UserVocabularyProgresses
            .AsNoTracking()
            .OrderByDescending(x => x.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.UserVocabularyProgresses.AsNoTracking().CountAsync(cancellationToken);

    public Task<UserVocabularyProgress?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.UserVocabularyProgresses.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsByUserAndVocabularyAsync(long userId, long vocabularyId, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.UserVocabularyProgresses.AsNoTracking().Where(x => x.UserId == userId && x.VocabularyId == vocabularyId);
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<UserVocabularyProgress> AddAsync(UserVocabularyProgress entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserVocabularyProgresses.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<UserVocabularyProgress> UpdateAsync(UserVocabularyProgress entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserVocabularyProgresses.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.UserVocabularyProgresses.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.UserVocabularyProgresses.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
