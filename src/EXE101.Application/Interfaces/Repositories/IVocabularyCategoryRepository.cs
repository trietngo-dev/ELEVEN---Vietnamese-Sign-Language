using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IVocabularyCategoryRepository
{
    Task<IReadOnlyList<VocabularyCategory>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<VocabularyCategory?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<VocabularyCategory> AddAsync(VocabularyCategory entity, CancellationToken cancellationToken = default);
    Task<VocabularyCategory> UpdateAsync(VocabularyCategory entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
