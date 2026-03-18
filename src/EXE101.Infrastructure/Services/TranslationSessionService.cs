using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.TranslationSessions;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class TranslationSessionService(
    ITranslationSessionRepository repository,
    AppDbContext dbContext) : ITranslationSessionService
{
    private readonly ITranslationSessionRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<TranslationSessionResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<TranslationSessionResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<TranslationSessionResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<TranslationSessionResponse> CreateAsync(CreateTranslationSessionRequest request, CancellationToken cancellationToken = default)
    {
        if (request.UserId.HasValue)
        {
            var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == request.UserId.Value, cancellationToken);
            if (!userExists)
            {
                throw new InvalidOperationException("User does not exist.");
            }
        }

        if (string.IsNullOrWhiteSpace(request.InputMode) || string.IsNullOrWhiteSpace(request.OutputMode))
        {
            throw new InvalidOperationException("InputMode and OutputMode are required.");
        }

        var entity = new TranslationSession
        {
            UserId = request.UserId,
            InputMode = request.InputMode.Trim(),
            OutputMode = request.OutputMode.Trim(),
            SignVariantUsed = request.SignVariantUsed,
            Status = SessionStatus.InProgress,
            StartedAt = DateTime.UtcNow,
            AverageConfidence = 0
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<TranslationSessionResponse?> UpdateAsync(long id, UpdateTranslationSessionRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        if (request.FinalAudioMediaId.HasValue)
        {
            var mediaExists = await _dbContext.MediaAssets.AsNoTracking().AnyAsync(x => x.Id == request.FinalAudioMediaId.Value, cancellationToken);
            if (!mediaExists)
            {
                throw new InvalidOperationException("Final audio media does not exist.");
            }
        }

        if (request.AverageConfidence < 0 || request.AverageConfidence > 100)
        {
            throw new InvalidOperationException("AverageConfidence must be in range 0-100.");
        }

        entity.Status = request.Status;
        entity.FinalText = request.FinalText;
        entity.FinalAudioMediaId = request.FinalAudioMediaId;
        entity.AverageConfidence = request.AverageConfidence;
        entity.EndedAt = request.EndedAt;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private static TranslationSessionResponse Map(TranslationSession entity)
    {
        return new TranslationSessionResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            InputMode = entity.InputMode,
            OutputMode = entity.OutputMode,
            SignVariantUsed = entity.SignVariantUsed,
            Status = entity.Status,
            FinalText = entity.FinalText,
            FinalAudioMediaId = entity.FinalAudioMediaId,
            AverageConfidence = entity.AverageConfidence,
            StartedAt = entity.StartedAt,
            EndedAt = entity.EndedAt
        };
    }
}
