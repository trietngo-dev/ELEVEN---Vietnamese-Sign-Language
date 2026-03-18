using EXE101.Application.Models.Common;
using EXE101.Application.Models.Vocabularies;

namespace EXE101.Application.Interfaces.Services;

public interface IVocabularyService
{
    Task<PagedResult<VocabularyResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<VocabularyResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<VocabularyResponse> CreateAsync(CreateVocabularyRequest request, CancellationToken cancellationToken = default);
    Task<VocabularyResponse?> UpdateAsync(long id, UpdateVocabularyRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
