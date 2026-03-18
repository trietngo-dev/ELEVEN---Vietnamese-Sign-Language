using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Badges;
using EXE101.Application.Models.Common;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class BadgeService(
    IBadgeRepository repository,
    AppDbContext dbContext) : IBadgeService
{
    private readonly IBadgeRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<BadgeResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<BadgeResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<BadgeResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<BadgeResponse> CreateAsync(CreateBadgeRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateIconAsync(request.IconMediaId, cancellationToken);
        ValidateRequired(request.Code, request.Name);

        var code = request.Code.Trim().ToUpperInvariant();
        var exists = await _repository.ExistsByCodeAsync(code, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Badge code already exists.");
        }

        var entity = new Badge
        {
            Code = code,
            Name = request.Name.Trim(),
            Description = request.Description,
            BadgeType = request.BadgeType,
            IconMediaId = request.IconMediaId,
            CriteriaJson = request.CriteriaJson,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<BadgeResponse?> UpdateAsync(long id, UpdateBadgeRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await ValidateIconAsync(request.IconMediaId, cancellationToken);
        ValidateRequired(request.Code, request.Name);

        var code = request.Code.Trim().ToUpperInvariant();
        var exists = await _repository.ExistsByCodeAsync(code, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Badge code already exists.");
        }

        entity.Code = code;
        entity.Name = request.Name.Trim();
        entity.Description = request.Description;
        entity.BadgeType = request.BadgeType;
        entity.IconMediaId = request.IconMediaId;
        entity.CriteriaJson = request.CriteriaJson;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateIconAsync(long? iconMediaId, CancellationToken cancellationToken)
    {
        if (!iconMediaId.HasValue)
        {
            return;
        }

        var mediaExists = await _dbContext.MediaAssets.AsNoTracking().AnyAsync(x => x.Id == iconMediaId.Value, cancellationToken);
        if (!mediaExists)
        {
            throw new InvalidOperationException("Icon media does not exist.");
        }
    }

    private static void ValidateRequired(string code, string name)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException("Code and Name are required.");
        }
    }

    private static BadgeResponse Map(Badge entity)
    {
        return new BadgeResponse
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            Description = entity.Description,
            BadgeType = entity.BadgeType,
            IconMediaId = entity.IconMediaId,
            CriteriaJson = entity.CriteriaJson,
            CreatedAt = entity.CreatedAt
        };
    }
}
