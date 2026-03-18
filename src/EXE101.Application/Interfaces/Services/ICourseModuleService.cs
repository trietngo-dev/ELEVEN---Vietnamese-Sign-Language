using EXE101.Application.Models.Common;
using EXE101.Application.Models.CourseModules;

namespace EXE101.Application.Interfaces.Services;

public interface ICourseModuleService
{
    Task<PagedResult<CourseModuleResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<CourseModuleResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<CourseModuleResponse> CreateAsync(CreateCourseModuleRequest request, CancellationToken cancellationToken = default);
    Task<CourseModuleResponse?> UpdateAsync(long id, UpdateCourseModuleRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
