using EXE101.Application.Models.Common;
using EXE101.Application.Models.TranslationSessions;

namespace EXE101.Application.Interfaces.Services;

public interface ITranslationSessionService
{
    Task<PagedResult<TranslationSessionResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<TranslationSessionResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<TranslationSessionResponse> CreateAsync(CreateTranslationSessionRequest request, CancellationToken cancellationToken = default);
    Task<TranslationSessionResponse?> UpdateAsync(long id, UpdateTranslationSessionRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
