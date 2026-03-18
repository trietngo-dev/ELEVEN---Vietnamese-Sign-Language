using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class EnrollmentRepository(AppDbContext dbContext) : IEnrollmentRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<Enrollment>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.Enrollments
            .AsNoTracking()
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.Enrollments.AsNoTracking().CountAsync(cancellationToken);

    public Task<Enrollment?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.Enrollments.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<Enrollment?> GetByUserAndCourseAsync(long userId, long courseId, CancellationToken cancellationToken = default)
        => _dbContext.Enrollments.FirstOrDefaultAsync(x => x.UserId == userId && x.CourseId == courseId, cancellationToken);

    public async Task<IReadOnlyList<Enrollment>> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Enrollments
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.UpdatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Enrollment> AddAsync(Enrollment entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Enrollments.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<Enrollment> UpdateAsync(Enrollment entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Enrollments.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }
}
