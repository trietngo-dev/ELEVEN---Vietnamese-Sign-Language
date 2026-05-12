using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.LessonVocabularies;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class LessonVocabularyService(
    ILessonVocabularyRepository repository,
    AppDbContext dbContext) : ILessonVocabularyService
{
    private readonly ILessonVocabularyRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<LessonVocabularyResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<LessonVocabularyResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<LessonVocabularyResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<LessonVocabularyResponse> CreateAsync(CreateLessonVocabularyRequest request, CancellationToken cancellationToken = default)
    {
        ValidateAccuracy(request.ExpectedAccuracy);
        await ValidateDependenciesAsync(request.LessonId, request.VocabularyId, cancellationToken);

        var exists = await _repository.ExistsByLessonAndVocabularyAsync(request.LessonId, request.VocabularyId, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Lesson vocabulary mapping already exists.");
        }

        var entity = new LessonVocabulary
        {
            LessonId = request.LessonId,
            VocabularyId = request.VocabularyId,
            SortOrder = request.SortOrder,
            IsRequired = request.IsRequired,
            ExpectedAccuracy = request.ExpectedAccuracy,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<LessonVocabularyResponse?> UpdateAsync(long id, UpdateLessonVocabularyRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateAccuracy(request.ExpectedAccuracy);
        await ValidateDependenciesAsync(request.LessonId, request.VocabularyId, cancellationToken);

        var exists = await _repository.ExistsByLessonAndVocabularyAsync(request.LessonId, request.VocabularyId, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Lesson vocabulary mapping already exists.");
        }

        entity.LessonId = request.LessonId;
        entity.VocabularyId = request.VocabularyId;
        entity.SortOrder = request.SortOrder;
        entity.IsRequired = request.IsRequired;
        entity.ExpectedAccuracy = request.ExpectedAccuracy;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private static void ValidateAccuracy(decimal expectedAccuracy)
    {
        if (expectedAccuracy < 0 || expectedAccuracy > 100)
        {
            throw new InvalidOperationException("ExpectedAccuracy must be in range 0-100.");
        }
    }

    private async Task ValidateDependenciesAsync(long lessonId, long vocabularyId, CancellationToken cancellationToken)
    {
        var lessonExists = await _dbContext.Lessons.AsNoTracking().AnyAsync(x => x.Id == lessonId, cancellationToken);
        if (!lessonExists)
        {
            throw new InvalidOperationException("Lesson does not exist.");
        }

        var vocabularyExists = await _dbContext.Vocabularies.AsNoTracking().AnyAsync(x => x.Id == vocabularyId, cancellationToken);
        if (!vocabularyExists)
        {
            throw new InvalidOperationException("Vocabulary does not exist.");
        }
    }

    private static LessonVocabularyResponse Map(LessonVocabulary entity)
    {
        return new LessonVocabularyResponse
        {
            Id = entity.Id,
            LessonId = entity.LessonId,
            VocabularyId = entity.VocabularyId,
            SortOrder = entity.SortOrder,
            IsRequired = entity.IsRequired,
            ExpectedAccuracy = entity.ExpectedAccuracy,
            CreatedAt = entity.CreatedAt
        };
    }
}
