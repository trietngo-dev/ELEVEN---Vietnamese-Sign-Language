using EXE101.Domain.Enums;

namespace EXE101.Application.Models.AuthAccounts;

public sealed class LinkAuthProviderRequest
{
    public long UserId { get; set; }
    public AuthProvider Provider { get; set; }
    public string ProviderUserId { get; set; } = string.Empty;
    public string? ProviderEmail { get; set; }
}

public sealed class AuthAccountResponse
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public AuthProvider Provider { get; set; }
    public string ProviderUserId { get; set; } = string.Empty;
    public string? ProviderEmail { get; set; }
    public DateTime CreatedAt { get; set; }
}
