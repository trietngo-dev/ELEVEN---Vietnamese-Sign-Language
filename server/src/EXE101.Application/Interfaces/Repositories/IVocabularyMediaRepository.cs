using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IVocabularyMediaRepository
{
    Task<IReadOnlyList<VocabularyMedia>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<VocabularyMedia?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByVocabularyAndMediaAsync(long vocabularyId, long mediaId, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<VocabularyMedia> AddAsync(VocabularyMedia entity, CancellationToken cancellationToken = default);
    Task<VocabularyMedia> UpdateAsync(VocabularyMedia entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
