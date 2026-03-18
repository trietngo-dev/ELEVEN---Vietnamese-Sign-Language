using EXE101.Application.Models.Common;
using EXE101.Application.Models.VocabularyCategories;

namespace EXE101.Application.Interfaces.Services;

public interface IVocabularyCategoryService
{
    Task<PagedResult<VocabularyCategoryResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<VocabularyCategoryResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<VocabularyCategoryResponse> CreateAsync(CreateVocabularyCategoryRequest request, CancellationToken cancellationToken = default);
    Task<VocabularyCategoryResponse?> UpdateAsync(long id, UpdateVocabularyCategoryRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
