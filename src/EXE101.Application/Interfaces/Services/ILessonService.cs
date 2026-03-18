using EXE101.Application.Models.Common;
using EXE101.Application.Models.Lessons;

namespace EXE101.Application.Interfaces.Services;

public interface ILessonService
{
    Task<PagedResult<LessonResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<LessonResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<LessonResponse> CreateAsync(CreateLessonRequest request, CancellationToken cancellationToken = default);
    Task<LessonResponse?> UpdateAsync(long id, UpdateLessonRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
