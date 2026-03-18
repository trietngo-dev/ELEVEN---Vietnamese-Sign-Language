using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class LessonAttemptRepository(AppDbContext dbContext) : ILessonAttemptRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<LessonAttempt>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.LessonAttempts
            .AsNoTracking()
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.LessonAttempts.AsNoTracking().CountAsync(cancellationToken);

    public Task<LessonAttempt?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.LessonAttempts.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<LessonAttempt> AddAsync(LessonAttempt entity, CancellationToken cancellationToken = default)
    {
        _dbContext.LessonAttempts.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<LessonAttempt> UpdateAsync(LessonAttempt entity, CancellationToken cancellationToken = default)
    {
        _dbContext.LessonAttempts.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.LessonAttempts.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.LessonAttempts.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
