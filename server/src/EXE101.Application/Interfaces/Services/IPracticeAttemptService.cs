using EXE101.Application.Models.Common;
using EXE101.Application.Models.PracticeAttempts;

namespace EXE101.Application.Interfaces.Services;

public interface IPracticeAttemptService
{
    Task<PagedResult<PracticeAttemptResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<PracticeAttemptResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<PracticeAttemptResponse> CreateAsync(CreatePracticeAttemptRequest request, CancellationToken cancellationToken = default);
    Task<PracticeAttemptResponse?> UpdateAsync(long id, UpdatePracticeAttemptRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
