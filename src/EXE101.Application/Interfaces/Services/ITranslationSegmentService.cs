using EXE101.Application.Models.Common;
using EXE101.Application.Models.TranslationSegments;

namespace EXE101.Application.Interfaces.Services;

public interface ITranslationSegmentService
{
    Task<PagedResult<TranslationSegmentResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<TranslationSegmentResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<TranslationSegmentResponse> CreateAsync(CreateTranslationSegmentRequest request, CancellationToken cancellationToken = default);
    Task<TranslationSegmentResponse?> UpdateAsync(long id, UpdateTranslationSegmentRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
