using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IFeedbackCategoryRepository
{
    Task<IReadOnlyList<FeedbackCategory>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<FeedbackCategory?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<FeedbackCategory> AddAsync(FeedbackCategory entity, CancellationToken cancellationToken = default);
    Task<FeedbackCategory> UpdateAsync(FeedbackCategory entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
