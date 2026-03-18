using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IPracticeAttemptRepository
{
    Task<IReadOnlyList<PracticeAttempt>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<PracticeAttempt?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<PracticeAttempt> AddAsync(PracticeAttempt entity, CancellationToken cancellationToken = default);
    Task<PracticeAttempt> UpdateAsync(PracticeAttempt entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
