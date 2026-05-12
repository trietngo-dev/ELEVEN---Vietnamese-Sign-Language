using EXE101.Application.Models.Common;
using EXE101.Application.Models.Notifications;

namespace EXE101.Application.Interfaces.Services;

public interface INotificationService
{
    Task<PagedResult<NotificationResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<NotificationResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<NotificationResponse> CreateAsync(CreateNotificationRequest request, CancellationToken cancellationToken = default);
    Task<NotificationResponse?> UpdateAsync(long id, UpdateNotificationRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
