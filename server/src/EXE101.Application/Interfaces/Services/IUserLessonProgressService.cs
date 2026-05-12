using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserLessonProgress;

namespace EXE101.Application.Interfaces.Services;

public interface IUserLessonProgressService
{
    Task<PagedResult<UserLessonProgressResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<UserLessonProgressResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<UserLessonProgressResponse> CreateAsync(CreateUserLessonProgressRequest request, CancellationToken cancellationToken = default);
    Task<UserLessonProgressResponse?> UpdateAsync(long id, UpdateUserLessonProgressRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
