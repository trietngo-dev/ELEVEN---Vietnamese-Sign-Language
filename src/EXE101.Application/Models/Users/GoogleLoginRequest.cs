namespace EXE101.Application.Models.Users;

public sealed class GoogleLoginRequest
{
    public string IdToken { get; set; } = string.Empty;
    public string? FullName { get; set; }
}
