using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class AdminActionLogRepository(AppDbContext dbContext) : IAdminActionLogRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<AdminActionLog>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.AdminActionLogs
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.AdminActionLogs.AsNoTracking().CountAsync(cancellationToken);

    public Task<AdminActionLog?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.AdminActionLogs.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<AdminActionLog> AddAsync(AdminActionLog entity, CancellationToken cancellationToken = default)
    {
        _dbContext.AdminActionLogs.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }
}
