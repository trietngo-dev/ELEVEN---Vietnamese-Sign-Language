using EXE101.Domain.Entities;
using EXE101.Domain.Enums;

namespace EXE101.Application.Interfaces.Repositories;

public interface IAuthAccountRepository
{
    Task<IReadOnlyList<AuthAccount>> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsByProviderAndProviderUserIdAsync(AuthProvider provider, string providerUserId, CancellationToken cancellationToken = default);
    Task<AuthAccount> AddAsync(AuthAccount entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteByUserIdAndProviderAsync(long userId, AuthProvider provider, CancellationToken cancellationToken = default);
}
