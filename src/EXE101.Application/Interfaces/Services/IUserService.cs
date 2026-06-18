using EXE101.Application.Models.Common;
using EXE101.Application.Models.Users;

namespace EXE101.Application.Interfaces.Services;

public interface IUserService
{
    Task<PagedResult<UserResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<UserResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<UserResponse?> UpdateAsync(long id, UpdateUserRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
    Task<UserResponse?> ChangeStatusAsync(long id, ChangeStatusRequest request, CancellationToken cancellationToken = default);
    Task<UserResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<UserResponse?> ChangePasswordAsync(long userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    Task<UserResponse?> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default);
    Task<UserResponse?> UpdateAvatarAsync(long userId, UpdateAvatarRequest request, CancellationToken cancellationToken = default);
    Task<LoginResponse> GoogleLoginAsync(GoogleLoginRequest request, CancellationToken cancellationToken = default);
}
