using EXE101.Application.Models.Common;
using EXE101.Application.Models.LessonAttempts;

namespace EXE101.Application.Interfaces.Services;

public interface ILessonAttemptService
{
    Task<PagedResult<LessonAttemptResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<LessonAttemptResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<LessonAttemptResponse> CreateAsync(CreateLessonAttemptRequest request, CancellationToken cancellationToken = default);
    Task<LessonAttemptResponse?> UpdateAsync(long id, UpdateLessonAttemptRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
