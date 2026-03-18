using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IUserProfileRepository
{
    Task<UserProfile?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    Task<UserProfile> AddAsync(UserProfile entity, CancellationToken cancellationToken = default);
    Task<UserProfile> UpdateAsync(UserProfile entity, CancellationToken cancellationToken = default);
}
