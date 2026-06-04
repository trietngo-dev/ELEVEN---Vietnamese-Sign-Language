using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserActivityLogs;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class UserActivityLogService(
    IUserActivityLogRepository repository,
    AppDbContext dbContext) : IUserActivityLogService
{
    private readonly IUserActivityLogRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<UserActivityLogResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<UserActivityLogResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<UserActivityLogResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<UserActivityLogResponse> CreateAsync(CreateUserActivityLogRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateUserAsync(request.UserId, cancellationToken);

        if (string.IsNullOrWhiteSpace(request.ActionType))
        {
            throw new InvalidOperationException("ActionType is required.");
        }

        var entity = new UserActivityLog
        {
            UserId = request.UserId,
            ActionType = request.ActionType.Trim(),
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            MetadataJson = request.MetadataJson,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);

        if (entity.ActionType.Equals("login", StringComparison.OrdinalIgnoreCase))
        {
            await UpdateUserStreakAsync(entity.UserId, cancellationToken);
        }

        return Map(created);
    }

    private async Task UpdateUserStreakAsync(long userId, CancellationToken cancellationToken)
    {
        var profile = await _dbContext.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (profile == null) return;

        var loginLogs = await _dbContext.UserActivityLogs
            .Where(l => l.UserId == userId && l.ActionType.ToLower() == "login")
            .Select(l => l.CreatedAt)
            .ToListAsync(cancellationToken);

        // Convert UTC to Vietnam local time (UTC+7)
        var localDates = loginLogs
            .Select(utc => utc.AddHours(7).Date)
            .Distinct()
            .OrderByDescending(date => date)
            .ToList();

        var today = DateTime.UtcNow.AddHours(7).Date;
        var yesterday = today.AddDays(-1);

        int streak = 0;
        if (localDates.Contains(today) || localDates.Contains(yesterday))
        {
            streak = 1;
            var startCheckDate = localDates.Contains(today) ? today : yesterday;
            int startIndex = localDates.IndexOf(startCheckDate);
            var checkTime = startCheckDate;

            for (int i = startIndex + 1; i < localDates.Count; i++)
            {
                var prevTime = localDates[i];
                int diffDays = (checkTime - prevTime).Days;
                if (diffDays == 1)
                {
                    streak++;
                    checkTime = prevTime;
                }
                else if (diffDays > 1)
                {
                    break;
                }
            }
        }

        profile.CurrentStreakDays = streak;
        _dbContext.UserProfiles.Update(profile);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidateUserAsync(long userId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }
    }

    private static UserActivityLogResponse Map(UserActivityLog entity)
    {
        return new UserActivityLogResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            ActionType = entity.ActionType,
            EntityType = entity.EntityType,
            EntityId = entity.EntityId,
            MetadataJson = entity.MetadataJson,
            CreatedAt = entity.CreatedAt
        };
    }
}
