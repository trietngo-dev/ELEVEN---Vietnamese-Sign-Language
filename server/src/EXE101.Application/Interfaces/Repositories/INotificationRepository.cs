using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface INotificationRepository
{
    Task<IReadOnlyList<Notification>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<Notification?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<Notification> AddAsync(Notification entity, CancellationToken cancellationToken = default);
    Task<Notification> UpdateAsync(Notification entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
