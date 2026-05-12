namespace EXE101.Application.Interfaces.Services;

public interface IJwtTokenService
{
    JwtTokenResult GenerateToken(long userId, string email, string fullName, string roleCode);
}

public sealed class JwtTokenResult
{
    public string AccessToken { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
}
