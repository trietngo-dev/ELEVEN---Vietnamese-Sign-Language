using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class UserSettingRepository(AppDbContext dbContext) : IUserSettingRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public Task<UserSetting?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default)
        => _dbContext.UserSettings.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);

    public async Task<UserSetting> AddAsync(UserSetting entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserSettings.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<UserSetting> UpdateAsync(UserSetting entity, CancellationToken cancellationToken = default)
    {
        _dbContext.UserSettings.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }
}
