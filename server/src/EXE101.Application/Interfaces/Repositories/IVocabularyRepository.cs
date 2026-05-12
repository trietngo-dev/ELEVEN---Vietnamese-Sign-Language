using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IVocabularyRepository
{
    Task<IReadOnlyList<Vocabulary>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<Vocabulary?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<Vocabulary> AddAsync(Vocabulary entity, CancellationToken cancellationToken = default);
    Task<Vocabulary> UpdateAsync(Vocabulary entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
