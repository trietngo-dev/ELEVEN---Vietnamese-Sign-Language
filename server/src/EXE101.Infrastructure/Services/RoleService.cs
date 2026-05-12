using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.Roles;
using EXE101.Domain.Entities;

namespace EXE101.Infrastructure.Services;

public sealed class RoleService(IRoleRepository repository) : IRoleService
{
    private readonly IRoleRepository _repository = repository;

    public async Task<PagedResult<RoleResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);

        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<RoleResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<RoleResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<RoleResponse> CreateAsync(CreateRoleRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            throw new InvalidOperationException("Code is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new InvalidOperationException("Name is required.");
        }

        var code = request.Code.Trim().ToLowerInvariant();
        var exists = await _repository.ExistsByCodeAsync(code, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Role code already exists.");
        }

        var entity = new Role
        {
            Code = code,
            Name = request.Name.Trim(),
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<RoleResponse?> UpdateAsync(long id, UpdateRoleRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(request.Code))
        {
            throw new InvalidOperationException("Code is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new InvalidOperationException("Name is required.");
        }

        var code = request.Code.Trim().ToLowerInvariant();
        var exists = await _repository.ExistsByCodeAsync(code, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Role code already exists.");
        }

        entity.Code = code;
        entity.Name = request.Name.Trim();
        entity.Description = request.Description;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private static RoleResponse Map(Role entity)
    {
        return new RoleResponse
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            Description = entity.Description,
            CreatedAt = entity.CreatedAt
        };
    }
}
