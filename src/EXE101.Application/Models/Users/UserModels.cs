using EXE101.Domain.Enums;

namespace EXE101.Application.Models.Users;

public sealed class CreateUserRequest
{
    public long RoleId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string FullName { get; set; } = string.Empty;
    public long? AvatarMediaId { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Active;
}

public sealed class UpdateUserRequest
{
    public long RoleId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public long? AvatarMediaId { get; set; }
    public UserStatus Status { get; set; }
}

public sealed class UserResponse
{
    public long Id { get; set; }
    public long RoleId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public long? AvatarMediaId { get; set; }
    public UserStatus Status { get; set; }
    public DateTime? EmailVerifiedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}

public sealed class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public sealed class LoginResponse
{
    public long UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string RoleCode { get; set; } = string.Empty;
    public string SessionToken { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Bearer";
    public DateTime ExpiresAtUtc { get; set; }
}

public sealed class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public sealed class VerifyEmailRequest
{
    public long UserId { get; set; }
}

public sealed class UpdateAvatarRequest
{
    public long AvatarMediaId { get; set; }
}

public sealed class ChangeStatusRequest
{
    public UserStatus Status { get; set; }
}

public sealed class RequestAccountDeletionOtpRequest
{
    public string Email { get; set; } = string.Empty;
}

public sealed class ConfirmAccountDeletionRequest
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public sealed class AccountDeletionOtpResponse
{
    public string Message { get; set; } = string.Empty;
}

public sealed class RequestPasswordResetOtpRequest
{
    public string Email { get; set; } = string.Empty;
}

public sealed class ConfirmPasswordResetRequest
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public sealed class PasswordResetOtpResponse
{
    public string Message { get; set; } = string.Empty;
}
