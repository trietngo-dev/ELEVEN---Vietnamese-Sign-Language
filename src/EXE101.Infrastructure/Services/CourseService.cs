using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.Courses;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class CourseService(
    ICourseRepository repository,
    AppDbContext dbContext) : ICourseService
{
    private readonly ICourseRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<CourseResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<CourseResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<CourseResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<CourseResponse> CreateAsync(CreateCourseRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequired(request.Title, request.Slug, request.Level);
        await ValidateDependenciesAsync(request.CategoryId, request.CreatedBy, request.CoverMediaId, request.TrailerMediaId, cancellationToken);

        var slug = request.Slug.Trim().ToLowerInvariant();
        var exists = await _repository.ExistsBySlugAsync(slug, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Course slug already exists.");
        }

        var now = DateTime.UtcNow;
        var entity = new Course
        {
            CategoryId = request.CategoryId,
            Title = request.Title.Trim(),
            Slug = slug,
            Summary = request.Summary,
            Description = request.Description,
            Level = request.Level.Trim(),
            CoverMediaId = request.CoverMediaId,
            TrailerMediaId = request.TrailerMediaId,
            IsPremium = request.IsPremium,
            Status = ContentStatus.Draft,
            CreatedBy = request.CreatedBy,
            UpdatedBy = request.CreatedBy,
            CreatedAt = now,
            UpdatedAt = now
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<CourseResponse?> UpdateAsync(long id, UpdateCourseRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateRequired(request.Title, request.Slug, request.Level);
        await ValidateDependenciesAsync(request.CategoryId, request.UpdatedBy, request.CoverMediaId, request.TrailerMediaId, cancellationToken);

        var slug = request.Slug.Trim().ToLowerInvariant();
        var exists = await _repository.ExistsBySlugAsync(slug, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Course slug already exists.");
        }

        entity.CategoryId = request.CategoryId;
        entity.Title = request.Title.Trim();
        entity.Slug = slug;
        entity.Summary = request.Summary;
        entity.Description = request.Description;
        entity.Level = request.Level.Trim();
        entity.CoverMediaId = request.CoverMediaId;
        entity.TrailerMediaId = request.TrailerMediaId;
        entity.IsPremium = request.IsPremium;
        entity.UpdatedBy = request.UpdatedBy;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public async Task<CourseResponse?> PublishAsync(long id, long updatedBy, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await ValidateUserAsync(updatedBy, cancellationToken);

        entity.Status = ContentStatus.Published;
        entity.PublishedAt ??= DateTime.UtcNow;
        entity.UpdatedBy = updatedBy;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public async Task<CourseResponse?> UnpublishAsync(long id, long updatedBy, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await ValidateUserAsync(updatedBy, cancellationToken);

        entity.Status = ContentStatus.Draft;
        entity.PublishedAt = null;
        entity.UpdatedBy = updatedBy;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    private static void ValidateRequired(string title, string slug, string level)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new InvalidOperationException("Title is required.");
        }

        if (string.IsNullOrWhiteSpace(slug))
        {
            throw new InvalidOperationException("Slug is required.");
        }

        if (string.IsNullOrWhiteSpace(level))
        {
            throw new InvalidOperationException("Level is required.");
        }
    }

    private async Task ValidateDependenciesAsync(long categoryId, long userId, long? coverMediaId, long? trailerMediaId, CancellationToken cancellationToken)
    {
        var categoryExists = await _dbContext.CourseCategories.AsNoTracking().AnyAsync(x => x.Id == categoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new InvalidOperationException("Course category does not exist.");
        }

        await ValidateUserAsync(userId, cancellationToken);

        if (coverMediaId.HasValue)
        {
            var coverExists = await _dbContext.MediaAssets.AsNoTracking().AnyAsync(x => x.Id == coverMediaId.Value, cancellationToken);
            if (!coverExists)
            {
                throw new InvalidOperationException("Cover media does not exist.");
            }
        }

        if (trailerMediaId.HasValue)
        {
            var trailerExists = await _dbContext.MediaAssets.AsNoTracking().AnyAsync(x => x.Id == trailerMediaId.Value, cancellationToken);
            if (!trailerExists)
            {
                throw new InvalidOperationException("Trailer media does not exist.");
            }
        }
    }

    private async Task ValidateUserAsync(long userId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }
    }

    private static CourseResponse Map(Course entity)
    {
        return new CourseResponse
        {
            Id = entity.Id,
            CategoryId = entity.CategoryId,
            Title = entity.Title,
            Slug = entity.Slug,
            Summary = entity.Summary,
            Description = entity.Description,
            Level = entity.Level,
            CoverMediaId = entity.CoverMediaId,
            TrailerMediaId = entity.TrailerMediaId,
            IsPremium = entity.IsPremium,
            Status = entity.Status,
            PublishedAt = entity.PublishedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedBy = entity.UpdatedBy,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
