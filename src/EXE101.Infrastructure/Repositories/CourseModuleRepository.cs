using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class CourseModuleRepository(AppDbContext dbContext) : ICourseModuleRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<CourseModule>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.CourseModules
            .AsNoTracking()
            .OrderBy(x => x.CourseId)
            .ThenBy(x => x.SortOrder)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.CourseModules.AsNoTracking().CountAsync(cancellationToken);

    public Task<CourseModule?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.CourseModules.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<CourseModule> AddAsync(CourseModule entity, CancellationToken cancellationToken = default)
    {
        _dbContext.CourseModules.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<CourseModule> UpdateAsync(CourseModule entity, CancellationToken cancellationToken = default)
    {
        _dbContext.CourseModules.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.CourseModules.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.CourseModules.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
