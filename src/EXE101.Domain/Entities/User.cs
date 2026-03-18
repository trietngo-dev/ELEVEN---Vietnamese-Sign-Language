using EXE101.Domain.Enums;

namespace EXE101.Domain.Entities;

public sealed class User
{
    public long Id { get; set; }
    public long RoleId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string FullName { get; set; } = string.Empty;
    public long? AvatarMediaId { get; set; }
    public UserStatus Status { get; set; }
    public DateTime? EmailVerifiedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
