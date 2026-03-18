using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.Notifications;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class NotificationService(
    INotificationRepository repository,
    AppDbContext dbContext) : INotificationService
{
    private readonly INotificationRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<NotificationResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<NotificationResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<NotificationResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<NotificationResponse> CreateAsync(CreateNotificationRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateUserAsync(request.UserId, cancellationToken);
        ValidateRequired(request.Title, request.Message, request.Type);

        var entity = new Notification
        {
            UserId = request.UserId,
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Type = request.Type.Trim(),
            IsRead = request.IsRead,
            ActionUrl = request.ActionUrl,
            CreatedAt = DateTime.UtcNow,
            ReadAt = request.IsRead ? DateTime.UtcNow : null
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<NotificationResponse?> UpdateAsync(long id, UpdateNotificationRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateRequired(request.Title, request.Message, request.Type);

        entity.Title = request.Title.Trim();
        entity.Message = request.Message.Trim();
        entity.Type = request.Type.Trim();
        entity.IsRead = request.IsRead;
        entity.ActionUrl = request.ActionUrl;
        entity.ReadAt = request.IsRead ? request.ReadAt ?? DateTime.UtcNow : null;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateUserAsync(long userId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }
    }

    private static void ValidateRequired(string title, string message, string type)
    {
        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(message) || string.IsNullOrWhiteSpace(type))
        {
            throw new InvalidOperationException("Title, Message and Type are required.");
        }
    }

    private static NotificationResponse Map(Notification entity)
    {
        return new NotificationResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            Title = entity.Title,
            Message = entity.Message,
            Type = entity.Type,
            IsRead = entity.IsRead,
            ActionUrl = entity.ActionUrl,
            CreatedAt = entity.CreatedAt,
            ReadAt = entity.ReadAt
        };
    }
}
