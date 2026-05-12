using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IUserVocabularyProgressRepository
{
    Task<IReadOnlyList<UserVocabularyProgress>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<UserVocabularyProgress?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByUserAndVocabularyAsync(long userId, long vocabularyId, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<UserVocabularyProgress> AddAsync(UserVocabularyProgress entity, CancellationToken cancellationToken = default);
    Task<UserVocabularyProgress> UpdateAsync(UserVocabularyProgress entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
