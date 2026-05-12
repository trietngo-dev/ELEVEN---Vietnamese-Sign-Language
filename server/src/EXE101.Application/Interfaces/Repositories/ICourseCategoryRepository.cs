using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface ICourseCategoryRepository
{
    Task<IReadOnlyList<CourseCategory>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<CourseCategory?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<CourseCategory> AddAsync(CourseCategory entity, CancellationToken cancellationToken = default);
    Task<CourseCategory> UpdateAsync(CourseCategory entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
