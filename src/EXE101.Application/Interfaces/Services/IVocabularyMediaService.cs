using EXE101.Application.Models.Common;
using EXE101.Application.Models.VocabularyMedia;

namespace EXE101.Application.Interfaces.Services;

public interface IVocabularyMediaService
{
    Task<PagedResult<VocabularyMediaResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<VocabularyMediaResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<VocabularyMediaResponse> CreateAsync(CreateVocabularyMediaRequest request, CancellationToken cancellationToken = default);
    Task<VocabularyMediaResponse?> UpdateAsync(long id, UpdateVocabularyMediaRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
