using EXE101.Application.Models.AuthAccounts;
using EXE101.Domain.Enums;

namespace EXE101.Application.Interfaces.Services;

public interface IAuthAccountService
{
    Task<AuthAccountResponse> LinkProviderAsync(LinkAuthProviderRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AuthAccountResponse>> GetLinkedAccountsByUserAsync(long userId, CancellationToken cancellationToken = default);
    Task<bool> UnlinkProviderAsync(long userId, AuthProvider provider, CancellationToken cancellationToken = default);
}
