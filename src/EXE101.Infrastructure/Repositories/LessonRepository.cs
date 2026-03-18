using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class LessonRepository(AppDbContext dbContext) : ILessonRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<Lesson>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.Lessons
            .AsNoTracking()
            .OrderBy(x => x.CourseId)
            .ThenBy(x => x.ModuleId)
            .ThenBy(x => x.SortOrder)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.Lessons.AsNoTracking().CountAsync(cancellationToken);

    public Task<Lesson?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.Lessons.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsBySlugAsync(string slug, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Lessons.AsNoTracking().Where(x => x.Slug == slug);
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<Lesson> AddAsync(Lesson entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Lessons.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<Lesson> UpdateAsync(Lesson entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Lessons.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Lessons.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.Lessons.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
