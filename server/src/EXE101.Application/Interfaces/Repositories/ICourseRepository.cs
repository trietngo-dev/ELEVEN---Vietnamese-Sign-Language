using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface ICourseRepository
{
    Task<IReadOnlyList<Course>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<Course?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<Course> AddAsync(Course entity, CancellationToken cancellationToken = default);
    Task<Course> UpdateAsync(Course entity, CancellationToken cancellationToken = default);
}
