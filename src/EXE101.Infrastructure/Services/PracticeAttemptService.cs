using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.PracticeAttempts;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class PracticeAttemptService(
    IPracticeAttemptRepository repository,
    AppDbContext dbContext) : IPracticeAttemptService
{
    private const decimal ConfidenceThreshold = 70m;
    private readonly IPracticeAttemptRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<PracticeAttemptResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<PracticeAttemptResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<PracticeAttemptResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<PracticeAttemptResponse> CreateAsync(CreatePracticeAttemptRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.PracticeSessionId, request.ExpectedVocabularyId, request.RecognizedVocabularyId, cancellationToken);

        var normalized = NormalizeRecognition(request.RecognizedText, request.Confidence);
        var isCorrect = CalculateCorrectness(request.IsCorrect, request.ExpectedText, normalized.RecognizedText);

        var entity = new PracticeAttempt
        {
            PracticeSessionId = request.PracticeSessionId,
            ExpectedVocabularyId = request.ExpectedVocabularyId,
            RecognizedVocabularyId = normalized.RecognizedVocabularyId ?? request.RecognizedVocabularyId,
            ExpectedText = request.ExpectedText,
            RecognizedText = normalized.RecognizedText,
            Confidence = request.Confidence,
            IsCorrect = isCorrect,
            ResponseTimeMs = request.ResponseTimeMs,
            FeedbackText = request.FeedbackText,
            SortOrder = request.SortOrder,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<PracticeAttemptResponse?> UpdateAsync(long id, UpdatePracticeAttemptRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await ValidateDependenciesAsync(entity.PracticeSessionId, request.ExpectedVocabularyId, request.RecognizedVocabularyId, cancellationToken);

        var normalized = NormalizeRecognition(request.RecognizedText, request.Confidence);
        var isCorrect = CalculateCorrectness(request.IsCorrect, request.ExpectedText, normalized.RecognizedText);

        entity.ExpectedVocabularyId = request.ExpectedVocabularyId;
        entity.RecognizedVocabularyId = normalized.RecognizedVocabularyId ?? request.RecognizedVocabularyId;
        entity.ExpectedText = request.ExpectedText;
        entity.RecognizedText = normalized.RecognizedText;
        entity.Confidence = request.Confidence;
        entity.IsCorrect = isCorrect;
        entity.ResponseTimeMs = request.ResponseTimeMs;
        entity.FeedbackText = request.FeedbackText;
        entity.SortOrder = request.SortOrder;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long practiceSessionId, long expectedVocabularyId, long? recognizedVocabularyId, CancellationToken cancellationToken)
    {
        var sessionExists = await _dbContext.PracticeSessions.AsNoTracking().AnyAsync(x => x.Id == practiceSessionId, cancellationToken);
        if (!sessionExists)
        {
            throw new InvalidOperationException("Practice session does not exist.");
        }

        var expectedExists = await _dbContext.Vocabularies.AsNoTracking().AnyAsync(x => x.Id == expectedVocabularyId, cancellationToken);
        if (!expectedExists)
        {
            throw new InvalidOperationException("Expected vocabulary does not exist.");
        }

        if (recognizedVocabularyId.HasValue)
        {
            var recognizedExists = await _dbContext.Vocabularies.AsNoTracking().AnyAsync(x => x.Id == recognizedVocabularyId.Value, cancellationToken);
            if (!recognizedExists)
            {
                throw new InvalidOperationException("Recognized vocabulary does not exist.");
            }
        }
    }

    private static (string? RecognizedText, long? RecognizedVocabularyId) NormalizeRecognition(string? recognizedText, decimal confidence)
    {
        if (confidence < 0 || confidence > 100)
        {
            throw new InvalidOperationException("Confidence must be in range 0-100.");
        }

        if (string.IsNullOrWhiteSpace(recognizedText) || confidence < ConfidenceThreshold)
        {
            return (null, null);
        }

        var normalized = recognizedText.Trim();
        if (string.Equals(normalized, "khonglamgi", StringComparison.OrdinalIgnoreCase))
        {
            return (null, null);
        }

        return (normalized, null);
    }

    private static bool CalculateCorrectness(bool providedIsCorrect, string? expectedText, string? recognizedText)
    {
        if (!string.IsNullOrWhiteSpace(expectedText) && !string.IsNullOrWhiteSpace(recognizedText))
        {
            var expected = expectedText.Trim().ToLowerInvariant();
            var recognized = recognizedText.Trim().ToLowerInvariant();
            return expected == recognized;
        }

        return providedIsCorrect;
    }

    private static PracticeAttemptResponse Map(PracticeAttempt entity)
    {
        return new PracticeAttemptResponse
        {
            Id = entity.Id,
            PracticeSessionId = entity.PracticeSessionId,
            ExpectedVocabularyId = entity.ExpectedVocabularyId,
            RecognizedVocabularyId = entity.RecognizedVocabularyId,
            ExpectedText = entity.ExpectedText,
            RecognizedText = entity.RecognizedText,
            Confidence = entity.Confidence,
            IsCorrect = entity.IsCorrect,
            ResponseTimeMs = entity.ResponseTimeMs,
            FeedbackText = entity.FeedbackText,
            SortOrder = entity.SortOrder,
            CreatedAt = entity.CreatedAt
        };
    }
}
