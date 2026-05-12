using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IUserSettingRepository
{
    Task<UserSetting?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    Task<UserSetting> AddAsync(UserSetting entity, CancellationToken cancellationToken = default);
    Task<UserSetting> UpdateAsync(UserSetting entity, CancellationToken cancellationToken = default);
}
