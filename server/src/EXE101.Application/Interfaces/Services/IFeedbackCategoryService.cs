using EXE101.Application.Models.Common;
using EXE101.Application.Models.FeedbackCategories;

namespace EXE101.Application.Interfaces.Services;

public interface IFeedbackCategoryService
{
    Task<PagedResult<FeedbackCategoryResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<FeedbackCategoryResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<FeedbackCategoryResponse> CreateAsync(CreateFeedbackCategoryRequest request, CancellationToken cancellationToken = default);
    Task<FeedbackCategoryResponse?> UpdateAsync(long id, UpdateFeedbackCategoryRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
