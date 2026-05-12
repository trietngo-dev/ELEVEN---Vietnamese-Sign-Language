using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.Enrollments;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class EnrollmentService(
    IEnrollmentRepository repository,
    AppDbContext dbContext) : IEnrollmentService
{
    private readonly IEnrollmentRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<EnrollmentResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);

        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<EnrollmentResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<EnrollmentResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<EnrollmentResponse> EnrollCourseAsync(EnrollCourseRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateUserAndCourseAsync(request.UserId, request.CourseId, cancellationToken);

        var existing = await _repository.GetByUserAndCourseAsync(request.UserId, request.CourseId, cancellationToken);
        if (existing is not null)
        {
            return Map(existing);
        }

        var now = DateTime.UtcNow;
        var entity = new Enrollment
        {
            UserId = request.UserId,
            CourseId = request.CourseId,
            Status = EnrollmentStatus.Enrolled,
            EnrolledAt = now,
            CreatedAt = now,
            UpdatedAt = now,
            ProgressPercent = 0
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<IReadOnlyList<EnrollmentResponse>> GetEnrollmentsByUserAsync(long userId, CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
        {
            throw new InvalidOperationException("UserId must be greater than zero.");
        }

        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var items = await _repository.GetByUserIdAsync(userId, cancellationToken);
        return items.Select(Map).ToList();
    }

    public async Task<EnrollmentResponse?> UpdateCurrentProgressAsync(long enrollmentId, UpdateEnrollmentProgressRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(enrollmentId, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateProgress(request.ProgressPercent);
        await ValidateCurrentProgressRefsAsync(entity.CourseId, request.CurrentModuleId, request.CurrentLessonId, cancellationToken);

        entity.CurrentModuleId = request.CurrentModuleId;
        entity.CurrentLessonId = request.CurrentLessonId;
        entity.ProgressPercent = request.ProgressPercent;
        entity.Status = request.ProgressPercent >= 100 ? EnrollmentStatus.Completed : EnrollmentStatus.InProgress;
        entity.StartedAt ??= DateTime.UtcNow;
        entity.CompletedAt = entity.Status == EnrollmentStatus.Completed ? DateTime.UtcNow : null;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public async Task<EnrollmentResponse?> CompleteEnrollmentAsync(long enrollmentId, CompleteEnrollmentRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(enrollmentId, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateProgress(request.ProgressPercent);

        entity.Status = EnrollmentStatus.Completed;
        entity.ProgressPercent = request.ProgressPercent < 100 ? 100 : request.ProgressPercent;
        entity.StartedAt ??= DateTime.UtcNow;
        entity.CompletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    private async Task ValidateUserAndCourseAsync(long userId, long courseId, CancellationToken cancellationToken)
    {
        if (userId <= 0 || courseId <= 0)
        {
            throw new InvalidOperationException("UserId and CourseId must be greater than zero.");
        }

        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var courseExists = await _dbContext.Courses.AsNoTracking().AnyAsync(x => x.Id == courseId, cancellationToken);
        if (!courseExists)
        {
            throw new InvalidOperationException("Course does not exist.");
        }
    }

    private async Task ValidateCurrentProgressRefsAsync(long courseId, long? currentModuleId, long? currentLessonId, CancellationToken cancellationToken)
    {
        if (currentModuleId.HasValue)
        {
            var module = await _dbContext.CourseModules.AsNoTracking().FirstOrDefaultAsync(x => x.Id == currentModuleId.Value, cancellationToken);
            if (module is null)
            {
                throw new InvalidOperationException("Current module does not exist.");
            }

            if (module.CourseId != courseId)
            {
                throw new InvalidOperationException("Current module does not belong to enrollment course.");
            }
        }

        if (currentLessonId.HasValue)
        {
            var lesson = await _dbContext.Lessons.AsNoTracking().FirstOrDefaultAsync(x => x.Id == currentLessonId.Value, cancellationToken);
            if (lesson is null)
            {
                throw new InvalidOperationException("Current lesson does not exist.");
            }

            if (lesson.CourseId != courseId)
            {
                throw new InvalidOperationException("Current lesson does not belong to enrollment course.");
            }

            if (currentModuleId.HasValue && lesson.ModuleId != currentModuleId.Value)
            {
                throw new InvalidOperationException("Current lesson does not belong to current module.");
            }
        }
    }

    private static void ValidateProgress(decimal progressPercent)
    {
        if (progressPercent < 0 || progressPercent > 100)
        {
            throw new InvalidOperationException("ProgressPercent must be in range 0-100.");
        }
    }

    private static EnrollmentResponse Map(Enrollment entity)
    {
        return new EnrollmentResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            CourseId = entity.CourseId,
            Status = entity.Status,
            EnrolledAt = entity.EnrolledAt,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
            CurrentModuleId = entity.CurrentModuleId,
            CurrentLessonId = entity.CurrentLessonId,
            ProgressPercent = entity.ProgressPercent,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
