using EXE101.Application.Models.Common;
using EXE101.Application.Models.PracticeSessions;

namespace EXE101.Application.Interfaces.Services;

public interface IPracticeSessionService
{
    Task<PagedResult<PracticeSessionResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<PracticeSessionResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<PracticeSessionResponse> CreateAsync(CreatePracticeSessionRequest request, CancellationToken cancellationToken = default);
    Task<PracticeSessionResponse?> UpdateAsync(long id, UpdatePracticeSessionRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
