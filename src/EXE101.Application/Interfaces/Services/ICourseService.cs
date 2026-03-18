using EXE101.Application.Models.Common;
using EXE101.Application.Models.Courses;

namespace EXE101.Application.Interfaces.Services;

public interface ICourseService
{
    Task<PagedResult<CourseResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<CourseResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<CourseResponse> CreateAsync(CreateCourseRequest request, CancellationToken cancellationToken = default);
    Task<CourseResponse?> UpdateAsync(long id, UpdateCourseRequest request, CancellationToken cancellationToken = default);
    Task<CourseResponse?> PublishAsync(long id, long updatedBy, CancellationToken cancellationToken = default);
    Task<CourseResponse?> UnpublishAsync(long id, long updatedBy, CancellationToken cancellationToken = default);
}
