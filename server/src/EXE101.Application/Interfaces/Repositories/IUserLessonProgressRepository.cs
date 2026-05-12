using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IUserLessonProgressRepository
{
    Task<IReadOnlyList<UserLessonProgress>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<UserLessonProgress?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByUserAndLessonAsync(long userId, long lessonId, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<UserLessonProgress> AddAsync(UserLessonProgress entity, CancellationToken cancellationToken = default);
    Task<UserLessonProgress> UpdateAsync(UserLessonProgress entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
