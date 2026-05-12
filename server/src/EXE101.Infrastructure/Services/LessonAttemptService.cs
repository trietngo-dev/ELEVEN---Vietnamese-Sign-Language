using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.LessonAttempts;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class LessonAttemptService(
    ILessonAttemptRepository repository,
    AppDbContext dbContext) : ILessonAttemptService
{
    private readonly ILessonAttemptRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<LessonAttemptResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);

        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<LessonAttemptResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<LessonAttemptResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<LessonAttemptResponse> CreateAsync(CreateLessonAttemptRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.LessonId, cancellationToken);
        ValidateMetrics(request.Accuracy, request.DurationSeconds, request.XpEarned, request.CompletionSource);

        var entity = new LessonAttempt
        {
            UserId = request.UserId,
            LessonId = request.LessonId,
            PracticeSessionId = request.PracticeSessionId,
            StartedAt = request.StartedAt,
            FinishedAt = request.FinishedAt,
            Accuracy = request.Accuracy,
            DurationSeconds = request.DurationSeconds,
            XpEarned = request.XpEarned,
            Passed = request.Passed,
            CompletionSource = request.CompletionSource.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<LessonAttemptResponse?> UpdateAsync(long id, UpdateLessonAttemptRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateMetrics(request.Accuracy, request.DurationSeconds, request.XpEarned, request.CompletionSource);

        entity.PracticeSessionId = request.PracticeSessionId;
        entity.StartedAt = request.StartedAt;
        entity.FinishedAt = request.FinishedAt;
        entity.Accuracy = request.Accuracy;
        entity.DurationSeconds = request.DurationSeconds;
        entity.XpEarned = request.XpEarned;
        entity.Passed = request.Passed;
        entity.CompletionSource = request.CompletionSource.Trim();

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
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

    private static void ValidateMetrics(decimal accuracy, int durationSeconds, int xpEarned, string completionSource)
    {
        if (accuracy < 0 || accuracy > 100)
        {
            throw new InvalidOperationException("Accuracy must be in range 0-100.");
        }

        if (durationSeconds < 0 || xpEarned < 0)
        {
            throw new InvalidOperationException("DurationSeconds and XpEarned must be greater than or equal to zero.");
        }

        if (string.IsNullOrWhiteSpace(completionSource))
        {
            throw new InvalidOperationException("CompletionSource is required.");
        }
    }

    private static LessonAttemptResponse Map(LessonAttempt entity)
    {
        return new LessonAttemptResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            LessonId = entity.LessonId,
            PracticeSessionId = entity.PracticeSessionId,
            StartedAt = entity.StartedAt,
            FinishedAt = entity.FinishedAt,
            Accuracy = entity.Accuracy,
            DurationSeconds = entity.DurationSeconds,
            XpEarned = entity.XpEarned,
            Passed = entity.Passed,
            CompletionSource = entity.CompletionSource,
            CreatedAt = entity.CreatedAt
        };
    }
}
