using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.UserSettings;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class UserSettingService(
    IUserSettingRepository repository,
    AppDbContext dbContext) : IUserSettingService
{
    private readonly IUserSettingRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<UserSettingResponse?> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new InvalidOperationException("UserId must be greater than zero.");
        }

        var setting = await _repository.GetByUserIdAsync(userId, cancellationToken);
        return setting is null ? null : Map(setting);
    }

    public async Task<UserSettingResponse> UpdateAsync(long userId, UpdateUserSettingRequest request, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new InvalidOperationException("UserId must be greater than zero.");
        }

        if (request.PlaybackSpeed <= 0)
        {
            throw new InvalidOperationException("PlaybackSpeed must be greater than zero.");
        }

        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var entity = await _repository.GetByUserIdAsync(userId, cancellationToken);
        if (entity is null)
        {
            var now = DateTime.UtcNow;
            entity = new UserSetting
            {
                UserId = userId,
                NotificationsEnabled = request.NotificationsEnabled,
                MarketingEmailsEnabled = request.MarketingEmailsEnabled,
                TranslationAutoSpeak = request.TranslationAutoSpeak,
                PlaybackSpeed = request.PlaybackSpeed,
                DailyGoalMinutes = request.DailyGoalMinutes,
                Theme = NormalizeTheme(request.Theme),
                CreatedAt = now,
                UpdatedAt = now
            };

            var created = await _repository.AddAsync(entity, cancellationToken);
            return Map(created);
        }

        entity.NotificationsEnabled = request.NotificationsEnabled;
        entity.MarketingEmailsEnabled = request.MarketingEmailsEnabled;
        entity.TranslationAutoSpeak = request.TranslationAutoSpeak;
        entity.PlaybackSpeed = request.PlaybackSpeed;
        entity.DailyGoalMinutes = request.DailyGoalMinutes;
        entity.Theme = NormalizeTheme(request.Theme);
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    private static string NormalizeTheme(string? theme)
    {
        if (string.IsNullOrWhiteSpace(theme))
        {
            return "light";
        }

        return theme.Trim().ToLowerInvariant();
    }

    private static UserSettingResponse Map(UserSetting entity)
    {
        return new UserSettingResponse
        {
            UserId = entity.UserId,
            NotificationsEnabled = entity.NotificationsEnabled,
            MarketingEmailsEnabled = entity.MarketingEmailsEnabled,
            TranslationAutoSpeak = entity.TranslationAutoSpeak,
            PlaybackSpeed = entity.PlaybackSpeed,
            DailyGoalMinutes = entity.DailyGoalMinutes,
            Theme = entity.Theme,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
