using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class CourseRepository(AppDbContext dbContext) : ICourseRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<Course>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.Courses
            .AsNoTracking()
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.Courses.AsNoTracking().CountAsync(cancellationToken);

    public Task<Course?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.Courses.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<bool> ExistsBySlugAsync(string slug, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Courses.AsNoTracking().Where(x => x.Slug == slug);
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<Course> AddAsync(Course entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Courses.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<Course> UpdateAsync(Course entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Courses.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }
}
