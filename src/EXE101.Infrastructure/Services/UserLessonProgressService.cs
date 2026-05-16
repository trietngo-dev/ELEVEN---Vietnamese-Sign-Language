using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserLessonProgress;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class UserLessonProgressService(
    IUserLessonProgressRepository repository,
    AppDbContext dbContext) : IUserLessonProgressService
{
    private readonly IUserLessonProgressRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<UserLessonProgressResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);

        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<UserLessonProgressResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<UserLessonProgressResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<UserLessonProgressResponse> CreateAsync(CreateUserLessonProgressRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.LessonId, cancellationToken);
        ValidateMetrics(request.LastPositionSeconds, request.AttemptsCount, request.BestAccuracy, request.BestScore, request.TotalTimeSeconds, request.XpEarned);

        var exists = await _repository.ExistsByUserAndLessonAsync(request.UserId, request.LessonId, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("User lesson progress already exists.");
        }

        var entity = new UserLessonProgress
        {
            UserId = request.UserId,
            LessonId = request.LessonId,
            Status = request.Status,
            StartedAt = request.StartedAt,
            CompletedAt = request.CompletedAt,
            LastPositionSeconds = request.LastPositionSeconds,
            AttemptsCount = request.AttemptsCount,
            BestAccuracy = request.BestAccuracy,
            BestScore = request.BestScore,
            TotalTimeSeconds = request.TotalTimeSeconds,
            XpEarned = request.XpEarned,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<UserLessonProgressResponse?> UpdateAsync(long id, UpdateUserLessonProgressRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateMetrics(request.LastPositionSeconds, request.AttemptsCount, request.BestAccuracy, request.BestScore, request.TotalTimeSeconds, request.XpEarned);

        entity.Status = request.Status;
        entity.StartedAt = request.StartedAt;
        entity.CompletedAt = request.CompletedAt;
        entity.LastPositionSeconds = request.LastPositionSeconds;
        entity.AttemptsCount = request.AttemptsCount;
        entity.BestAccuracy = request.BestAccuracy;
        entity.BestScore = request.BestScore;
        entity.TotalTimeSeconds = request.TotalTimeSeconds;
        entity.XpEarned = request.XpEarned;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public async Task<UserLessonProgressResponse> UpsertAsync(CreateUserLessonProgressRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.LessonId, cancellationToken);
        ValidateMetrics(request.LastPositionSeconds, request.AttemptsCount, request.BestAccuracy, request.BestScore, request.TotalTimeSeconds, request.XpEarned);

        var existing = await _repository.GetByUserAndLessonAsync(request.UserId, request.LessonId, cancellationToken);
        if (existing != null)
        {
            existing.Status = request.Status;
            if (request.StartedAt.HasValue) existing.StartedAt = request.StartedAt;
            if (request.CompletedAt.HasValue) existing.CompletedAt = request.CompletedAt;
            existing.LastPositionSeconds = request.LastPositionSeconds;
            
            // Only update attempt count and best scores if it makes sense
            existing.AttemptsCount += request.AttemptsCount; // Accumulate attempts if passed, or maybe just +1. Actually let's assume client sends exact count or we increment. If frontend sends 1, we add 1.
            if (request.BestAccuracy > existing.BestAccuracy) existing.BestAccuracy = request.BestAccuracy;
            if (request.BestScore > existing.BestScore) existing.BestScore = request.BestScore;
            
            existing.TotalTimeSeconds += request.TotalTimeSeconds;
            
            // For XpEarned, maybe don't add if already earned. Let's just set if it's higher.
            if (request.XpEarned > existing.XpEarned) existing.XpEarned = request.XpEarned;
            
            existing.UpdatedAt = DateTime.UtcNow;

            var updated = await _repository.UpdateAsync(existing, cancellationToken);
            return Map(updated);
        }
        else
        {
            var entity = new UserLessonProgress
            {
                UserId = request.UserId,
                LessonId = request.LessonId,
                Status = request.Status,
                StartedAt = request.StartedAt,
                CompletedAt = request.CompletedAt,
                LastPositionSeconds = request.LastPositionSeconds,
                AttemptsCount = request.AttemptsCount > 0 ? request.AttemptsCount : 1, // Default 1 attempt
                BestAccuracy = request.BestAccuracy,
                BestScore = request.BestScore,
                TotalTimeSeconds = request.TotalTimeSeconds,
                XpEarned = request.XpEarned,
                UpdatedAt = DateTime.UtcNow
            };

            var created = await _repository.AddAsync(entity, cancellationToken);
            return Map(created);
        }
    }

    public async Task<IReadOnlyList<UserLessonProgressResponse>> GetByUserAndCourseAsync(long userId, long courseId, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetByUserAndCourseAsync(userId, courseId, cancellationToken);
        return entities.Select(Map).ToList();
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long userId, long lessonId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var lessonExists = await _dbContext.Lessons.AsNoTracking().AnyAsync(x => x.Id == lessonId, cancellationToken);
        if (!lessonExists)
        {
            throw new InvalidOperationException("Lesson does not exist.");
        }
    }

    private static void ValidateMetrics(int lastPositionSeconds, int attemptsCount, decimal bestAccuracy, decimal bestScore, int totalTimeSeconds, int xpEarned)
    {
        if (lastPositionSeconds < 0 || attemptsCount < 0 || totalTimeSeconds < 0 || xpEarned < 0)
        {
            throw new InvalidOperationException("Numeric metrics must be greater than or equal to zero.");
        }

        if (bestAccuracy < 0 || bestAccuracy > 100)
        {
            throw new InvalidOperationException("BestAccuracy must be in range 0-100.");
        }

        if (bestScore < 0)
        {
            throw new InvalidOperationException("BestScore must be greater than or equal to zero.");
        }
    }

    private static UserLessonProgressResponse Map(UserLessonProgress entity)
    {
        return new UserLessonProgressResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            LessonId = entity.LessonId,
            Status = entity.Status,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
            LastPositionSeconds = entity.LastPositionSeconds,
            AttemptsCount = entity.AttemptsCount,
            BestAccuracy = entity.BestAccuracy,
            BestScore = entity.BestScore,
            TotalTimeSeconds = entity.TotalTimeSeconds,
            XpEarned = entity.XpEarned,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
