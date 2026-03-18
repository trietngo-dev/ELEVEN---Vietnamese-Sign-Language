using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.Vocabularies;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class VocabularyService(
    IVocabularyRepository repository,
    AppDbContext dbContext) : IVocabularyService
{
    private readonly IVocabularyRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<VocabularyResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<VocabularyResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<VocabularyResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<VocabularyResponse> CreateAsync(CreateVocabularyRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.TermVi))
        {
            throw new InvalidOperationException("TermVi is required.");
        }

        if (string.IsNullOrWhiteSpace(request.DifficultyLevel))
        {
            throw new InvalidOperationException("DifficultyLevel is required.");
        }

        await ValidateDependenciesAsync(request.CategoryId, request.CreatedBy, cancellationToken);

        var now = DateTime.UtcNow;
        var normalizedTerm = request.TermVi.Trim().ToLowerInvariant();
        var entity = new Vocabulary
        {
            CategoryId = request.CategoryId,
            Code = NormalizeCode(request.Code),
            TermVi = request.TermVi.Trim(),
            NormalizedTerm = normalizedTerm,
            Description = request.Description,
            UsageExample = request.UsageExample,
            DifficultyLevel = request.DifficultyLevel.Trim(),
            HandHintText = request.HandHintText,
            IsFeatured = request.IsFeatured,
            Status = ContentStatus.Draft,
            CreatedBy = request.CreatedBy,
            CreatedAt = now,
            UpdatedAt = now
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<VocabularyResponse?> UpdateAsync(long id, UpdateVocabularyRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(request.TermVi))
        {
            throw new InvalidOperationException("TermVi is required.");
        }

        if (string.IsNullOrWhiteSpace(request.DifficultyLevel))
        {
            throw new InvalidOperationException("DifficultyLevel is required.");
        }

        var categoryExists = await _dbContext.VocabularyCategories.AsNoTracking().AnyAsync(x => x.Id == request.CategoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new InvalidOperationException("Vocabulary category does not exist.");
        }

        entity.CategoryId = request.CategoryId;
        entity.Code = NormalizeCode(request.Code);
        entity.TermVi = request.TermVi.Trim();
        entity.NormalizedTerm = request.TermVi.Trim().ToLowerInvariant();
        entity.Description = request.Description;
        entity.UsageExample = request.UsageExample;
        entity.DifficultyLevel = request.DifficultyLevel.Trim();
        entity.HandHintText = request.HandHintText;
        entity.IsFeatured = request.IsFeatured;
        entity.Status = request.Status;
        entity.PublishedAt = request.Status == ContentStatus.Published
            ? entity.PublishedAt ?? DateTime.UtcNow
            : null;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long categoryId, long createdBy, CancellationToken cancellationToken)
    {
        var categoryExists = await _dbContext.VocabularyCategories.AsNoTracking().AnyAsync(x => x.Id == categoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new InvalidOperationException("Vocabulary category does not exist.");
        }

        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == createdBy, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }
    }

    private static string? NormalizeCode(string? code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return null;
        }

        return code.Trim().ToUpperInvariant();
    }

    private static VocabularyResponse Map(Vocabulary entity)
    {
        return new VocabularyResponse
        {
            Id = entity.Id,
            CategoryId = entity.CategoryId,
            Code = entity.Code,
            TermVi = entity.TermVi,
            NormalizedTerm = entity.NormalizedTerm,
            Description = entity.Description,
            UsageExample = entity.UsageExample,
            DifficultyLevel = entity.DifficultyLevel,
            HandHintText = entity.HandHintText,
            IsFeatured = entity.IsFeatured,
            Status = entity.Status,
            CreatedBy = entity.CreatedBy,
            PublishedAt = entity.PublishedAt,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
