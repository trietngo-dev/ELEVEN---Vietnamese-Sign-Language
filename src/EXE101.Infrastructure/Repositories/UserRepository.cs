using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class UserRepository(AppDbContext dbContext) : IUserRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<User>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.Users
            .AsNoTracking()
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.Users.AsNoTracking().CountAsync(cancellationToken);

    public Task<User?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        => _dbContext.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

    public Task<bool> ExistsByEmailAsync(string email, long? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Users.AsNoTracking().Where(x => x.Email == email);
        if (excludeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }

    public async Task<User> AddAsync(User entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Users.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<User> UpdateAsync(User entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Users.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Users.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        // Reassign created/performed content to default admin to prevent RESTRICT constraint violations
        var defaultAdmin = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == "admin@exe101.local", cancellationToken);
        long defaultAdminId = defaultAdmin?.Id ?? 1;

        var coursesCreated = await _dbContext.Courses
            .Where(c => c.CreatedBy == id)
            .ToListAsync(cancellationToken);
        foreach (var course in coursesCreated)
        {
            course.CreatedBy = defaultAdminId;
        }

        var vocabCreated = await _dbContext.Vocabularies
            .Where(v => v.CreatedBy == id)
            .ToListAsync(cancellationToken);
        foreach (var vocab in vocabCreated)
        {
            vocab.CreatedBy = defaultAdminId;
        }

        var adminLogs = await _dbContext.AdminActionLogs
            .Where(l => l.AdminUserId == id)
            .ToListAsync(cancellationToken);
        foreach (var log in adminLogs)
        {
            log.AdminUserId = defaultAdminId;
        }

        _dbContext.Users.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
