using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface ITranslationSessionRepository
{
    Task<IReadOnlyList<TranslationSession>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<TranslationSession?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<TranslationSession> AddAsync(TranslationSession entity, CancellationToken cancellationToken = default);
    Task<TranslationSession> UpdateAsync(TranslationSession entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
