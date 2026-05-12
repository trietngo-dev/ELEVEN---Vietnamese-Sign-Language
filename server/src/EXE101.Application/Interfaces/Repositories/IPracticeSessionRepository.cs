using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IPracticeSessionRepository
{
    Task<IReadOnlyList<PracticeSession>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<PracticeSession?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<PracticeSession> AddAsync(PracticeSession entity, CancellationToken cancellationToken = default);
    Task<PracticeSession> UpdateAsync(PracticeSession entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
