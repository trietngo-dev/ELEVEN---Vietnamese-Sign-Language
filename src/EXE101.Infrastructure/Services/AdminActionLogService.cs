using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.AdminActionLogs;
using EXE101.Application.Models.Common;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class AdminActionLogService(
    IAdminActionLogRepository repository,
    AppDbContext dbContext) : IAdminActionLogService
{
    private readonly IAdminActionLogRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<AdminActionLogResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<AdminActionLogResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<AdminActionLogResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<AdminActionLogResponse> CreateAsync(CreateAdminActionLogRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateAdminAsync(request.AdminUserId, cancellationToken);

        if (string.IsNullOrWhiteSpace(request.ActionType))
        {
            throw new InvalidOperationException("ActionType is required.");
        }

        var entity = new AdminActionLog
        {
            AdminUserId = request.AdminUserId,
            ActionType = request.ActionType.Trim(),
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    private async Task ValidateAdminAsync(long adminId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == adminId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("Admin user does not exist.");
        }
    }

    private static AdminActionLogResponse Map(AdminActionLog entity)
    {
        return new AdminActionLogResponse
        {
            Id = entity.Id,
            AdminUserId = entity.AdminUserId,
            ActionType = entity.ActionType,
            EntityType = entity.EntityType,
            EntityId = entity.EntityId,
            Description = entity.Description,
            CreatedAt = entity.CreatedAt
        };
    }
}
