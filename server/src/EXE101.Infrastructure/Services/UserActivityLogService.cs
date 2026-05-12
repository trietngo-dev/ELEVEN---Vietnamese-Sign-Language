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
        return Map(created);
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
