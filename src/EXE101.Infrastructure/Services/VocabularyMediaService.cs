using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.VocabularyMedia;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class VocabularyMediaService(
    IVocabularyMediaRepository repository,
    AppDbContext dbContext) : IVocabularyMediaService
{
    private readonly IVocabularyMediaRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<VocabularyMediaResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<VocabularyMediaResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<VocabularyMediaResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<VocabularyMediaResponse> CreateAsync(CreateVocabularyMediaRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequest(request.UsageType);
        await ValidateDependenciesAsync(request.VocabularyId, request.MediaId, cancellationToken);

        var exists = await _repository.ExistsByVocabularyAndMediaAsync(request.VocabularyId, request.MediaId, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Vocabulary media mapping already exists.");
        }

        var entity = new VocabularyMedia
        {
            VocabularyId = request.VocabularyId,
            MediaId = request.MediaId,
            UsageType = request.UsageType.Trim(),
            IsPrimary = request.IsPrimary,
            SortOrder = request.SortOrder,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<VocabularyMediaResponse?> UpdateAsync(long id, UpdateVocabularyMediaRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateRequest(request.UsageType);
        await ValidateDependenciesAsync(request.VocabularyId, request.MediaId, cancellationToken);

        var exists = await _repository.ExistsByVocabularyAndMediaAsync(request.VocabularyId, request.MediaId, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Vocabulary media mapping already exists.");
        }

        entity.VocabularyId = request.VocabularyId;
        entity.MediaId = request.MediaId;
        entity.UsageType = request.UsageType.Trim();
        entity.IsPrimary = request.IsPrimary;
        entity.SortOrder = request.SortOrder;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private static void ValidateRequest(string usageType)
    {
        if (string.IsNullOrWhiteSpace(usageType))
        {
            throw new InvalidOperationException("UsageType is required.");
        }
    }

    private async Task ValidateDependenciesAsync(long vocabularyId, long mediaId, CancellationToken cancellationToken)
    {
        var vocabularyExists = await _dbContext.Vocabularies.AsNoTracking().AnyAsync(x => x.Id == vocabularyId, cancellationToken);
        if (!vocabularyExists)
        {
            throw new InvalidOperationException("Vocabulary does not exist.");
        }

        var mediaExists = await _dbContext.MediaAssets.AsNoTracking().AnyAsync(x => x.Id == mediaId, cancellationToken);
        if (!mediaExists)
        {
            throw new InvalidOperationException("Media asset does not exist.");
        }
    }

    private static VocabularyMediaResponse Map(VocabularyMedia entity)
    {
        return new VocabularyMediaResponse
        {
            Id = entity.Id,
            VocabularyId = entity.VocabularyId,
            MediaId = entity.MediaId,
            UsageType = entity.UsageType,
            IsPrimary = entity.IsPrimary,
            SortOrder = entity.SortOrder,
            CreatedAt = entity.CreatedAt
        };
    }
}
