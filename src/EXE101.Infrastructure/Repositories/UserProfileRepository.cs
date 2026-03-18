using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class UserProfileRepository(AppDbContext dbContext) : IUserProfileRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public Task<UserProfile?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default)
        => _dbContext.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

    public async Task<UserProfile> AddAsync(UserProfile entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserProfiles.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<UserProfile> UpdateAsync(UserProfile entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserProfiles.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }
}
