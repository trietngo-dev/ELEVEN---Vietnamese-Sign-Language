using EXE101.Application.Models.Common;
using EXE101.Application.Models.Enrollments;

namespace EXE101.Application.Interfaces.Services;

public interface IEnrollmentService
{
    Task<PagedResult<EnrollmentResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<EnrollmentResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<EnrollmentResponse> EnrollCourseAsync(EnrollCourseRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EnrollmentResponse>> GetEnrollmentsByUserAsync(long userId, CancellationToken cancellationToken = default);
    Task<EnrollmentResponse?> UpdateCurrentProgressAsync(long enrollmentId, UpdateEnrollmentProgressRequest request, CancellationToken cancellationToken = default);
    Task<EnrollmentResponse?> CompleteEnrollmentAsync(long enrollmentId, CompleteEnrollmentRequest request, CancellationToken cancellationToken = default);
}
