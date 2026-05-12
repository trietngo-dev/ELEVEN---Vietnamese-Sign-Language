using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class AuthAccountRepository(AppDbContext dbContext) : IAuthAccountRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<AuthAccount>> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.AuthAccounts
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ExistsByProviderAndProviderUserIdAsync(AuthProvider provider, string providerUserId, CancellationToken cancellationToken = default)
    {
        return _dbContext.AuthAccounts.AsNoTracking()
            .AnyAsync(x => x.Provider == provider && x.ProviderUserId == providerUserId, cancellationToken);
    }

    public async Task<AuthAccount> AddAsync(AuthAccount entity, CancellationToken cancellationToken = default)
    {
        _dbContext.AuthAccounts.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteByUserIdAndProviderAsync(long userId, AuthProvider provider, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.AuthAccounts
            .Where(x => x.UserId == userId && x.Provider == provider)
            .ToListAsync(cancellationToken);

        if (entities.Count == 0)
        {
            return false;
        }

        _dbContext.AuthAccounts.RemoveRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
