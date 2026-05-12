using EXE101.Domain.Enums;

namespace EXE101.Domain.Entities;

public sealed class AuthAccount
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public AuthProvider Provider { get; set; }
    public string ProviderUserId { get; set; } = string.Empty;
    public string? ProviderEmail { get; set; }
    public DateTime CreatedAt { get; set; }
}
