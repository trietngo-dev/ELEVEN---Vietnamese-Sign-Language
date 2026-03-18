using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IEnrollmentRepository
{
    Task<IReadOnlyList<Enrollment>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<Enrollment?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<Enrollment?> GetByUserAndCourseAsync(long userId, long courseId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Enrollment>> GetByUserIdAsync(long userId, CancellationToken cancellationToken = default);
    Task<Enrollment> AddAsync(Enrollment entity, CancellationToken cancellationToken = default);
    Task<Enrollment> UpdateAsync(Enrollment entity, CancellationToken cancellationToken = default);
}
