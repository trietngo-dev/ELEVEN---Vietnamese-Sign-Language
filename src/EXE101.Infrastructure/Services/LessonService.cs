using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.Lessons;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class LessonService(
    ILessonRepository repository,
    AppDbContext dbContext) : ILessonService
{
    private readonly ILessonRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<LessonResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<LessonResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<LessonDetailResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Lessons
            .AsNoTracking()
            .Include(x => x.VideoMediaAsset)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity is null ? null : MapDetail(entity);
    }

    public async Task<LessonResponse> CreateAsync(CreateLessonRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequired(request.Title, request.Slug, request.LessonType, request.DifficultyLevel, request.EstimatedMinutes, request.XpReward);
        await ValidateDependenciesAsync(request.CourseId, request.ModuleId, request.CoverMediaId, request.VideoMediaId, cancellationToken);

        var slug = request.Slug.Trim().ToLowerInvariant();
        var exists = await _repository.ExistsBySlugAsync(slug, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Lesson slug already exists.");
        }

        var now = DateTime.UtcNow;
        var entity = new Lesson
        {
            CourseId = request.CourseId,
            ModuleId = request.ModuleId,
            Title = request.Title.Trim(),
            Slug = slug,
            ShortDescription = request.ShortDescription,
            ObjectiveText = request.ObjectiveText,
            CoverMediaId = request.CoverMediaId,
            VideoMediaId = request.VideoMediaId,
            LessonType = request.LessonType.Trim(),
            DifficultyLevel = request.DifficultyLevel.Trim(),
            EstimatedMinutes = request.EstimatedMinutes,
            XpReward = request.XpReward,
            SortOrder = request.SortOrder,
            Status = ContentStatus.Draft,
            CreatedAt = now,
            UpdatedAt = now
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<LessonResponse?> UpdateAsync(long id, UpdateLessonRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateRequired(request.Title, request.Slug, request.LessonType, request.DifficultyLevel, request.EstimatedMinutes, request.XpReward);
        await ValidateDependenciesAsync(request.CourseId, request.ModuleId, request.CoverMediaId, request.VideoMediaId, cancellationToken);

        var slug = request.Slug.Trim().ToLowerInvariant();
        var exists = await _repository.ExistsBySlugAsync(slug, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Lesson slug already exists.");
        }

        entity.CourseId = request.CourseId;
        entity.ModuleId = request.ModuleId;
        entity.Title = request.Title.Trim();
        entity.Slug = slug;
        entity.ShortDescription = request.ShortDescription;
        entity.ObjectiveText = request.ObjectiveText;
        entity.CoverMediaId = request.CoverMediaId;
        entity.VideoMediaId = request.VideoMediaId;
        entity.LessonType = request.LessonType.Trim();
        entity.DifficultyLevel = request.DifficultyLevel.Trim();
        entity.EstimatedMinutes = request.EstimatedMinutes;
        entity.XpReward = request.XpReward;
        entity.SortOrder = request.SortOrder;
        entity.Status = request.Status;
        entity.PublishedAt = request.Status == ContentStatus.Published
            ? entity.PublishedAt ?? DateTime.UtcNow
            : null;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public async Task<LessonDetailResponse?> UpdateVideoAsync(long id, UpdateLessonVideoRequest request, CancellationToken cancellationToken = default)
    {
        if (request.VideoMediaId <= 0)
        {
            throw new InvalidOperationException("VideoMediaId must be greater than zero.");
        }

        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        var videoExists = await _dbContext.MediaAssets.AsNoTracking().AnyAsync(x => x.Id == request.VideoMediaId, cancellationToken);
        if (!videoExists)
        {
            throw new InvalidOperationException("Video media does not exist.");
        }

        entity.VideoMediaId = request.VideoMediaId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity, cancellationToken);

        var updatedLesson = await _dbContext.Lessons
            .AsNoTracking()
            .Include(x => x.VideoMediaAsset)
            .FirstOrDefaultAsync(x => x.Id == entity.Id, cancellationToken);

        return updatedLesson is null ? null : MapDetail(updatedLesson);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private static void ValidateRequired(string title, string slug, string lessonType, string difficultyLevel, int estimatedMinutes, int xpReward)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new InvalidOperationException("Title is required.");
        }

        if (string.IsNullOrWhiteSpace(slug))
        {
            throw new InvalidOperationException("Slug is required.");
        }

        if (string.IsNullOrWhiteSpace(lessonType))
        {
            throw new InvalidOperationException("LessonType is required.");
        }

        if (string.IsNullOrWhiteSpace(difficultyLevel))
        {
            throw new InvalidOperationException("DifficultyLevel is required.");
        }

        if (estimatedMinutes < 0)
        {
            throw new InvalidOperationException("EstimatedMinutes must be greater than or equal to zero.");
        }

        if (xpReward < 0)
        {
            throw new InvalidOperationException("XpReward must be greater than or equal to zero.");
        }
    }

    private async Task ValidateDependenciesAsync(long courseId, long moduleId, long? coverMediaId, long? videoMediaId, CancellationToken cancellationToken)
    {
        var courseExists = await _dbContext.Courses.AsNoTracking().AnyAsync(x => x.Id == courseId, cancellationToken);
        if (!courseExists)
        {
            throw new InvalidOperationException("Course does not exist.");
        }

        var module = await _dbContext.CourseModules.AsNoTracking().FirstOrDefaultAsync(x => x.Id == moduleId, cancellationToken);
        if (module is null)
        {
            throw new InvalidOperationException("Course module does not exist.");
        }

        if (module.CourseId != courseId)
        {
            throw new InvalidOperationException("Course module does not belong to the specified course.");
        }

        if (coverMediaId.HasValue)
        {
            var coverExists = await _dbContext.MediaAssets.AsNoTracking().AnyAsync(x => x.Id == coverMediaId.Value, cancellationToken);
            if (!coverExists)
            {
                throw new InvalidOperationException("Cover media does not exist.");
            }
        }

        if (videoMediaId.HasValue)
        {
            var videoExists = await _dbContext.MediaAssets.AsNoTracking().AnyAsync(x => x.Id == videoMediaId.Value, cancellationToken);
            if (!videoExists)
            {
                throw new InvalidOperationException("Video media does not exist.");
            }
        }
    }

    private static LessonResponse Map(Lesson entity)
    {
        return new LessonResponse
        {
            Id = entity.Id,
            CourseId = entity.CourseId,
            ModuleId = entity.ModuleId,
            Title = entity.Title,
            Slug = entity.Slug,
            ShortDescription = entity.ShortDescription,
            ObjectiveText = entity.ObjectiveText,
            CoverMediaId = entity.CoverMediaId,
            VideoMediaId = entity.VideoMediaId,
            LessonType = entity.LessonType,
            DifficultyLevel = entity.DifficultyLevel,
            EstimatedMinutes = entity.EstimatedMinutes,
            XpReward = entity.XpReward,
            SortOrder = entity.SortOrder,
            Status = entity.Status,
            PublishedAt = entity.PublishedAt,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    private static LessonDetailResponse MapDetail(Lesson entity)
    {
        return new LessonDetailResponse
        {
            Id = entity.Id,
            CourseId = entity.CourseId,
            ModuleId = entity.ModuleId,
            Title = entity.Title,
            Slug = entity.Slug,
            ShortDescription = entity.ShortDescription,
            ObjectiveText = entity.ObjectiveText,
            CoverMediaId = entity.CoverMediaId,
            VideoMediaId = entity.VideoMediaId,
            VideoUrl = entity.VideoMediaAsset?.FileUrl,
            LessonType = entity.LessonType,
            DifficultyLevel = entity.DifficultyLevel,
            EstimatedMinutes = entity.EstimatedMinutes,
            XpReward = entity.XpReward,
            SortOrder = entity.SortOrder,
            Status = entity.Status,
            PublishedAt = entity.PublishedAt,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
