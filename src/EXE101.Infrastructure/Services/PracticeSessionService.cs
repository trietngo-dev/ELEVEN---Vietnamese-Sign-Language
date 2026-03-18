using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.PracticeSessions;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class PracticeSessionService(
    IPracticeSessionRepository repository,
    AppDbContext dbContext) : IPracticeSessionService
{
    private readonly IPracticeSessionRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<PracticeSessionResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<PracticeSessionResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<PracticeSessionResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<PracticeSessionResponse> CreateAsync(CreatePracticeSessionRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.CourseId, request.LessonId, request.VocabularyId, cancellationToken);

        if (string.IsNullOrWhiteSpace(request.Mode))
        {
            throw new InvalidOperationException("Mode is required.");
        }

        if (request.TotalItems < 0)
        {
            throw new InvalidOperationException("TotalItems must be greater than or equal to zero.");
        }

        var entity = new PracticeSession
        {
            UserId = request.UserId,
            CourseId = request.CourseId,
            LessonId = request.LessonId,
            VocabularyId = request.VocabularyId,
            Mode = request.Mode.Trim(),
            PromptText = request.PromptText,
            Status = SessionStatus.InProgress,
            TotalItems = request.TotalItems,
            CorrectItems = 0,
            Accuracy = 0,
            StartedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<PracticeSessionResponse?> UpdateAsync(long id, UpdatePracticeSessionRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        if (request.TotalItems < 0 || request.CorrectItems < 0)
        {
            throw new InvalidOperationException("TotalItems and CorrectItems must be greater than or equal to zero.");
        }

        if (request.Accuracy < 0 || request.Accuracy > 100)
        {
            throw new InvalidOperationException("Accuracy must be in range 0-100.");
        }

        entity.Status = request.Status;
        entity.TotalItems = request.TotalItems;
        entity.CorrectItems = request.CorrectItems;
        entity.Accuracy = request.Accuracy;
        entity.EndedAt = request.EndedAt;
        entity.Notes = request.Notes;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long userId, long? courseId, long? lessonId, long? vocabularyId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        if (courseId.HasValue)
        {
            var courseExists = await _dbContext.Courses.AsNoTracking().AnyAsync(x => x.Id == courseId.Value, cancellationToken);
            if (!courseExists)
            {
                throw new InvalidOperationException("Course does not exist.");
            }
        }

        if (lessonId.HasValue)
        {
            var lesson = await _dbContext.Lessons.AsNoTracking().FirstOrDefaultAsync(x => x.Id == lessonId.Value, cancellationToken);
            if (lesson is null)
            {
                throw new InvalidOperationException("Lesson does not exist.");
            }

            if (courseId.HasValue && lesson.CourseId != courseId.Value)
            {
                throw new InvalidOperationException("Lesson does not belong to selected course.");
            }
        }

        if (vocabularyId.HasValue)
        {
            var vocabularyExists = await _dbContext.Vocabularies.AsNoTracking().AnyAsync(x => x.Id == vocabularyId.Value, cancellationToken);
            if (!vocabularyExists)
            {
                throw new InvalidOperationException("Vocabulary does not exist.");
            }
        }
    }

    private static PracticeSessionResponse Map(PracticeSession entity)
    {
        return new PracticeSessionResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            CourseId = entity.CourseId,
            LessonId = entity.LessonId,
            VocabularyId = entity.VocabularyId,
            Mode = entity.Mode,
            PromptText = entity.PromptText,
            Status = entity.Status,
            TotalItems = entity.TotalItems,
            CorrectItems = entity.CorrectItems,
            Accuracy = entity.Accuracy,
            StartedAt = entity.StartedAt,
            EndedAt = entity.EndedAt,
            Notes = entity.Notes
        };
    }
}
