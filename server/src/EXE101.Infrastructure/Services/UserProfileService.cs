using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.UserProfiles;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class UserProfileService(
    IUserProfileRepository repository,
    AppDbContext dbContext) : IUserProfileService
{
    private readonly IUserProfileRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<UserProfileResponse> CreateAsync(CreateUserProfileRequest request, CancellationToken cancellationToken = default)
    {
        if (request.UserId <= 0)
        {
            throw new InvalidOperationException("UserId must be greater than zero.");
        }

        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == request.UserId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var existed = await _repository.GetByUserIdAsync(request.UserId, cancellationToken);
        if (existed is not null)
        {
            throw new InvalidOperationException("User profile already exists.");
        }

        var now = DateTime.UtcNow;
        var entity = new UserProfile
        {
            UserId = request.UserId,
            Phone = request.Phone,
            DateOfBirth = request.DateOfBirth,
            Gender = request.Gender,
            Bio = request.Bio,
            Timezone = string.IsNullOrWhiteSpace(request.Timezone) ? "Asia/Ho_Chi_Minh" : request.Timezone.Trim(),
            PreferredSignVariant = request.PreferredSignVariant,
            CurrentStreakDays = request.CurrentStreakDays,
            TotalXp = request.TotalXp,
            CreatedAt = now,
            UpdatedAt = now
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<UserProfileResponse?> UpdateAsync(long userId, UpdateUserProfileRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByUserIdAsync(userId, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        entity.Phone = request.Phone;
        entity.DateOfBirth = request.DateOfBirth;
        entity.Gender = request.Gender;
        entity.Bio = request.Bio;
        entity.Timezone = string.IsNullOrWhiteSpace(request.Timezone) ? entity.Timezone : request.Timezone.Trim();
        entity.PreferredSignVariant = request.PreferredSignVariant;
        entity.CurrentStreakDays = request.CurrentStreakDays;
        entity.TotalXp = request.TotalXp;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public async Task<UserProfileResponse?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByUserIdAsync(userId, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    private static UserProfileResponse Map(UserProfile entity)
    {
        return new UserProfileResponse
        {
            UserId = entity.UserId,
            Phone = entity.Phone,
            DateOfBirth = entity.DateOfBirth,
            Gender = entity.Gender,
            Bio = entity.Bio,
            Timezone = entity.Timezone,
            PreferredSignVariant = entity.PreferredSignVariant,
            CurrentStreakDays = entity.CurrentStreakDays,
            TotalXp = entity.TotalXp,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
