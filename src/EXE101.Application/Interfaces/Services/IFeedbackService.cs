using EXE101.Application.Models.Common;
using EXE101.Application.Models.Feedbacks;

namespace EXE101.Application.Interfaces.Services;

public interface IFeedbackService
{
    Task<PagedResult<FeedbackResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<FeedbackResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<FeedbackResponse> CreateAsync(CreateFeedbackRequest request, CancellationToken cancellationToken = default);
    Task<FeedbackResponse?> UpdateAsync(long id, UpdateFeedbackRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
