using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class UserActivityLogRepository(AppDbContext dbContext) : IUserActivityLogRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<UserActivityLog>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.UserActivityLogs
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.UserActivityLogs.AsNoTracking().CountAsync(cancellationToken);

    public Task<UserActivityLog?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.UserActivityLogs.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<UserActivityLog> AddAsync(UserActivityLog entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserActivityLogs.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }
}
