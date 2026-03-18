using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface ILessonAttemptRepository
{
    Task<IReadOnlyList<LessonAttempt>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<LessonAttempt?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<LessonAttempt> AddAsync(LessonAttempt entity, CancellationToken cancellationToken = default);
    Task<LessonAttempt> UpdateAsync(LessonAttempt entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
