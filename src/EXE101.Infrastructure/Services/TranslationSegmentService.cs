using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.TranslationSegments;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class TranslationSegmentService(
    ITranslationSegmentRepository repository,
    AppDbContext dbContext) : ITranslationSegmentService
{
    private const decimal ConfidenceThreshold = 70m;
    private readonly ITranslationSegmentRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<TranslationSegmentResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<TranslationSegmentResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<TranslationSegmentResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<TranslationSegmentResponse> CreateAsync(CreateTranslationSegmentRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.SessionId, request.MatchedVocabularyId, request.AudioMediaId, cancellationToken);

        var normalized = await NormalizePredictionAsync(request.RecognizedText, request.Confidence, request.MatchedVocabularyId, cancellationToken);

        var entity = new TranslationSegment
        {
            SessionId = request.SessionId,
            SegmentOrder = request.SegmentOrder,
            RecognizedText = normalized.RecognizedText,
            NormalizedText = normalized.NormalizedText,
            Confidence = request.Confidence,
            MatchedVocabularyId = normalized.MatchedVocabularyId,
            StartedAt = request.StartedAt,
            EndedAt = request.EndedAt,
            AudioMediaId = request.AudioMediaId,
            RawPredictionJson = request.RawPredictionJson,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<TranslationSegmentResponse?> UpdateAsync(long id, UpdateTranslationSegmentRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await ValidateDependenciesAsync(entity.SessionId, request.MatchedVocabularyId, request.AudioMediaId, cancellationToken);

        var normalized = await NormalizePredictionAsync(request.RecognizedText, request.Confidence, request.MatchedVocabularyId, cancellationToken);

        entity.SegmentOrder = request.SegmentOrder;
        entity.RecognizedText = normalized.RecognizedText;
        entity.NormalizedText = normalized.NormalizedText;
        entity.Confidence = request.Confidence;
        entity.MatchedVocabularyId = normalized.MatchedVocabularyId;
        entity.StartedAt = request.StartedAt;
        entity.EndedAt = request.EndedAt;
        entity.AudioMediaId = request.AudioMediaId;
        entity.RawPredictionJson = request.RawPredictionJson;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long sessionId, long? matchedVocabularyId, long? audioMediaId, CancellationToken cancellationToken)
    {
        var sessionExists = await _dbContext.TranslationSessions.AsNoTracking().AnyAsync(x => x.Id == sessionId, cancellationToken);
        if (!sessionExists)
        {
            throw new InvalidOperationException("Translation session does not exist.");
        }

        if (matchedVocabularyId.HasValue)
        {
            var vocabularyExists = await _dbContext.Vocabularies.AsNoTracking().AnyAsync(x => x.Id == matchedVocabularyId.Value, cancellationToken);
            if (!vocabularyExists)
            {
                throw new InvalidOperationException("Matched vocabulary does not exist.");
            }
        }

        if (audioMediaId.HasValue)
        {
            var mediaExists = await _dbContext.MediaAssets.AsNoTracking().AnyAsync(x => x.Id == audioMediaId.Value, cancellationToken);
            if (!mediaExists)
            {
                throw new InvalidOperationException("Audio media does not exist.");
            }
        }

        if (sessionId <= 0)
        {
            throw new InvalidOperationException("SessionId must be greater than zero.");
        }
    }

    private async Task<(string RecognizedText, string? NormalizedText, long? MatchedVocabularyId)> NormalizePredictionAsync(string recognizedText, decimal confidence, long? matchedVocabularyId, CancellationToken cancellationToken)
    {
        var normalizedText = string.IsNullOrWhiteSpace(recognizedText)
            ? null
            : recognizedText.Trim().ToLowerInvariant();

        var blocked = confidence < ConfidenceThreshold || string.Equals(normalizedText, "khonglamgi", StringComparison.OrdinalIgnoreCase);
        if (blocked)
        {
            return (string.Empty, null, null);
        }

        if (!matchedVocabularyId.HasValue && !string.IsNullOrWhiteSpace(normalizedText))
        {
            var matchedVocabulary = await _dbContext.Vocabularies
                .AsNoTracking()
                .Where(x => x.NormalizedTerm == normalizedText)
                .Select(x => x.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (matchedVocabulary > 0)
            {
                matchedVocabularyId = matchedVocabulary;
            }
        }

        return (recognizedText.Trim(), normalizedText, matchedVocabularyId);
    }

    private static TranslationSegmentResponse Map(TranslationSegment entity)
    {
        return new TranslationSegmentResponse
        {
            Id = entity.Id,
            SessionId = entity.SessionId,
            SegmentOrder = entity.SegmentOrder,
            RecognizedText = entity.RecognizedText,
            NormalizedText = entity.NormalizedText,
            Confidence = entity.Confidence,
            MatchedVocabularyId = entity.MatchedVocabularyId,
            StartedAt = entity.StartedAt,
            EndedAt = entity.EndedAt,
            AudioMediaId = entity.AudioMediaId,
            RawPredictionJson = entity.RawPredictionJson,
            CreatedAt = entity.CreatedAt
        };
    }
}
