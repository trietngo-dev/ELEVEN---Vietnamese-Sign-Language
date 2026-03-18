using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.CourseModules;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class CourseModuleService(
    ICourseModuleRepository repository,
    AppDbContext dbContext) : ICourseModuleService
{
    private readonly ICourseModuleRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<CourseModuleResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<CourseModuleResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<CourseModuleResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<CourseModuleResponse> CreateAsync(CreateCourseModuleRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new InvalidOperationException("Title is required.");
        }

        await ValidateCourseAsync(request.CourseId, cancellationToken);

        var now = DateTime.UtcNow;
        var entity = new CourseModule
        {
            CourseId = request.CourseId,
            Title = request.Title.Trim(),
            Description = request.Description,
            SortOrder = request.SortOrder,
            IsPreview = request.IsPreview,
            CreatedAt = now,
            UpdatedAt = now
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<CourseModuleResponse?> UpdateAsync(long id, UpdateCourseModuleRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new InvalidOperationException("Title is required.");
        }

        await ValidateCourseAsync(request.CourseId, cancellationToken);

        entity.CourseId = request.CourseId;
        entity.Title = request.Title.Trim();
        entity.Description = request.Description;
        entity.SortOrder = request.SortOrder;
        entity.IsPreview = request.IsPreview;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateCourseAsync(long courseId, CancellationToken cancellationToken)
    {
        var courseExists = await _dbContext.Courses.AsNoTracking().AnyAsync(x => x.Id == courseId, cancellationToken);
        if (!courseExists)
        {
            throw new InvalidOperationException("Course does not exist.");
        }
    }

    private static CourseModuleResponse Map(CourseModule entity)
    {
        return new CourseModuleResponse
        {
            Id = entity.Id,
            CourseId = entity.CourseId,
            Title = entity.Title,
            Description = entity.Description,
            SortOrder = entity.SortOrder,
            IsPreview = entity.IsPreview,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
