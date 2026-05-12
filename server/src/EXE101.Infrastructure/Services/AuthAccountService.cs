using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.AuthAccounts;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class AuthAccountService(
    IAuthAccountRepository repository,
    AppDbContext dbContext) : IAuthAccountService
{
    private readonly IAuthAccountRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<AuthAccountResponse> LinkProviderAsync(LinkAuthProviderRequest request, CancellationToken cancellationToken = default)
    {
        if (request.UserId <= 0)
        {
            throw new InvalidOperationException("UserId must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.ProviderUserId))
        {
            throw new InvalidOperationException("ProviderUserId is required.");
        }

        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == request.UserId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var providerUserId = request.ProviderUserId.Trim();
        var duplicated = await _repository.ExistsByProviderAndProviderUserIdAsync(request.Provider, providerUserId, cancellationToken);
        if (duplicated)
        {
            throw new InvalidOperationException("Provider account is already linked.");
        }

        var entity = new AuthAccount
        {
            UserId = request.UserId,
            Provider = request.Provider,
            ProviderUserId = providerUserId,
            ProviderEmail = string.IsNullOrWhiteSpace(request.ProviderEmail) ? null : request.ProviderEmail.Trim().ToLowerInvariant(),
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<IReadOnlyList<AuthAccountResponse>> GetLinkedAccountsByUserAsync(long userId, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new InvalidOperationException("UserId must be greater than zero.");
        }

        var entities = await _repository.GetByUserIdAsync(userId, cancellationToken);
        return entities.Select(Map).ToList();
    }

    public Task<bool> UnlinkProviderAsync(long userId, AuthProvider provider, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new InvalidOperationException("UserId must be greater than zero.");
        }

        return _repository.DeleteByUserIdAndProviderAsync(userId, provider, cancellationToken);
    }

    private static AuthAccountResponse Map(AuthAccount entity)
    {
        return new AuthAccountResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            Provider = entity.Provider,
            ProviderUserId = entity.ProviderUserId,
            ProviderEmail = entity.ProviderEmail,
            CreatedAt = entity.CreatedAt
        };
    }
}
