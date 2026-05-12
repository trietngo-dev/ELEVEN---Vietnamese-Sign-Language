using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.VocabularyCategories;
using EXE101.Domain.Entities;

namespace EXE101.Infrastructure.Services;

public sealed class VocabularyCategoryService(IVocabularyCategoryRepository repository) : IVocabularyCategoryService
{
    private readonly IVocabularyCategoryRepository _repository = repository;

    public async Task<PagedResult<VocabularyCategoryResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<VocabularyCategoryResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<VocabularyCategoryResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<VocabularyCategoryResponse> CreateAsync(CreateVocabularyCategoryRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new InvalidOperationException("Name is required.");
        }

        var slug = NormalizeSlug(request.Slug);
        var exists = await _repository.ExistsBySlugAsync(slug, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Vocabulary category slug already exists.");
        }

        var entity = new VocabularyCategory
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description,
            DisplayOrder = request.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<VocabularyCategoryResponse?> UpdateAsync(long id, UpdateVocabularyCategoryRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new InvalidOperationException("Name is required.");
        }

        var slug = NormalizeSlug(request.Slug);
        var exists = await _repository.ExistsBySlugAsync(slug, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Vocabulary category slug already exists.");
        }

        entity.Name = request.Name.Trim();
        entity.Slug = slug;
        entity.Description = request.Description;
        entity.DisplayOrder = request.DisplayOrder;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private static string NormalizeSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            throw new InvalidOperationException("Slug is required.");
        }

        return slug.Trim().ToLowerInvariant();
    }

    private static VocabularyCategoryResponse Map(VocabularyCategory entity)
    {
        return new VocabularyCategoryResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Slug = entity.Slug,
            Description = entity.Description,
            DisplayOrder = entity.DisplayOrder,
            CreatedAt = entity.CreatedAt
        };
    }
}
