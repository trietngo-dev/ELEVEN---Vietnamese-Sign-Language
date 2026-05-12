using EXE101.Application.Models.Common;
using EXE101.Application.Models.CourseCategories;

namespace EXE101.Application.Interfaces.Services;

public interface ICourseCategoryService
{
    Task<PagedResult<CourseCategoryResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<CourseCategoryResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<CourseCategoryResponse> CreateAsync(CreateCourseCategoryRequest request, CancellationToken cancellationToken = default);
    Task<CourseCategoryResponse?> UpdateAsync(long id, UpdateCourseCategoryRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
