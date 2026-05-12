using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface ILessonRepository
{
    Task<IReadOnlyList<Lesson>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<Lesson?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<Lesson> AddAsync(Lesson entity, CancellationToken cancellationToken = default);
    Task<Lesson> UpdateAsync(Lesson entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
