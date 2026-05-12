using EXE101.Application.Models.UserProfiles;

namespace EXE101.Application.Interfaces.Services;

public interface IUserProfileService
{
    Task<UserProfileResponse> CreateAsync(CreateUserProfileRequest request, CancellationToken cancellationToken = default);
    Task<UserProfileResponse?> UpdateAsync(long userId, UpdateUserProfileRequest request, CancellationToken cancellationToken = default);
    Task<UserProfileResponse?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default);
}
