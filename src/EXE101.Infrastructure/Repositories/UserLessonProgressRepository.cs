using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class UserLessonProgressRepository(AppDbContext dbContext) : IUserLessonProgressRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<UserLessonProgress>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.UserLessonProgresses
            .AsNoTracking()
            .OrderByDescending(x => x.UpdatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.UserLessonProgresses.AsNoTracking().CountAsync(cancellationToken);

    public Task<UserLessonProgress?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.UserLessonProgresses.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsByUserAndLessonAsync(long userId, long lessonId, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.UserLessonProgresses.AsNoTracking().Where(x => x.UserId == userId && x.LessonId == lessonId);
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<UserLessonProgress> AddAsync(UserLessonProgress entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserLessonProgresses.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<UserLessonProgress> UpdateAsync(UserLessonProgress entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserLessonProgresses.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.UserLessonProgresses.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.UserLessonProgresses.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
