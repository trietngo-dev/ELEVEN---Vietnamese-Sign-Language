using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface ICourseModuleRepository
{
    Task<IReadOnlyList<CourseModule>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<CourseModule?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<CourseModule> AddAsync(CourseModule entity, CancellationToken cancellationToken = default);
    Task<CourseModule> UpdateAsync(CourseModule entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
