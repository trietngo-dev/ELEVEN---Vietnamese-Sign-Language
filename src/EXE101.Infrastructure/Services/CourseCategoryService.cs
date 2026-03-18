using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.CourseCategories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class CourseCategoryService(
    ICourseCategoryRepository repository,
    AppDbContext dbContext) : ICourseCategoryService
{
    private readonly ICourseCategoryRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<CourseCategoryResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<CourseCategoryResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<CourseCategoryResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<CourseCategoryResponse> CreateAsync(CreateCourseCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var slug = NormalizeSlug(request.Slug);
        ValidateName(request.Name);
        await ValidateIconMediaAsync(request.IconMediaId, cancellationToken);

        var exists = await _repository.ExistsBySlugAsync(slug, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Course category slug already exists.");
        }

        var entity = new CourseCategory
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description,
            ColorHex = request.ColorHex,
            IconMediaId = request.IconMediaId,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<CourseCategoryResponse?> UpdateAsync(long id, UpdateCourseCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        var slug = NormalizeSlug(request.Slug);
        ValidateName(request.Name);
        await ValidateIconMediaAsync(request.IconMediaId, cancellationToken);

        var exists = await _repository.ExistsBySlugAsync(slug, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Course category slug already exists.");
        }

        entity.Name = request.Name.Trim();
        entity.Slug = slug;
        entity.Description = request.Description;
        entity.ColorHex = request.ColorHex;
        entity.IconMediaId = request.IconMediaId;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateIconMediaAsync(long? iconMediaId, CancellationToken cancellationToken)
    {
        if (!iconMediaId.HasValue)
        {
            return;
        }

        var exists = await _dbContext.MediaAssets.AsNoTracking().AnyAsync(x => x.Id == iconMediaId.Value, cancellationToken);
        if (!exists)
        {
            throw new InvalidOperationException("Icon media does not exist.");
        }
    }

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException("Name is required.");
        }
    }

    private static string NormalizeSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            throw new InvalidOperationException("Slug is required.");
        }

        return slug.Trim().ToLowerInvariant();
    }

    private static CourseCategoryResponse Map(CourseCategory entity)
    {
        return new CourseCategoryResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Slug = entity.Slug,
            Description = entity.Description,
            ColorHex = entity.ColorHex,
            IconMediaId = entity.IconMediaId,
            CreatedAt = entity.CreatedAt
        };
    }
}
