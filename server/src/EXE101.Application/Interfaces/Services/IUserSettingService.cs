using EXE101.Application.Models.UserSettings;

namespace EXE101.Application.Interfaces.Services;

public interface IUserSettingService
{
    Task<UserSettingResponse?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    Task<UserSettingResponse> UpdateAsync(long userId, UpdateUserSettingRequest request, CancellationToken cancellationToken = default);
}
