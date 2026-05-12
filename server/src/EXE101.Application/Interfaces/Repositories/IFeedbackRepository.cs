using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IFeedbackRepository
{
    Task<IReadOnlyList<Feedback>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<Feedback?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<Feedback> AddAsync(Feedback entity, CancellationToken cancellationToken = default);
    Task<Feedback> UpdateAsync(Feedback entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
