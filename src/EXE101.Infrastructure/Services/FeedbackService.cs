using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.Feedbacks;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class FeedbackService(
    IFeedbackRepository repository,
    AppDbContext dbContext) : IFeedbackService
{
    private readonly IFeedbackRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<FeedbackResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);
        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<FeedbackResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<FeedbackResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<FeedbackResponse> CreateAsync(CreateFeedbackRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.CategoryId, null, cancellationToken);
        ValidateContent(request.Rating, request.Content);

        var now = DateTime.UtcNow;
        var entity = new Feedback
        {
            UserId = request.UserId,
            CategoryId = request.CategoryId,
            Rating = request.Rating,
            Subject = request.Subject,
            Content = request.Content.Trim(),
            Status = FeedbackStatus.New,
            CreatedAt = now,
            UpdatedAt = now
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<FeedbackResponse?> UpdateAsync(long id, UpdateFeedbackRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await ValidateDependenciesAsync(entity.UserId, request.CategoryId, request.RespondedBy, cancellationToken);
        ValidateContent(request.Rating, request.Content);

        entity.CategoryId = request.CategoryId;
        entity.Rating = request.Rating;
        entity.Subject = request.Subject;
        entity.Content = request.Content.Trim();
        entity.Status = request.Status;
        entity.AdminReply = request.AdminReply;
        entity.RespondedBy = request.RespondedBy;
        entity.RespondedAt = request.RespondedAt;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long userId, long categoryId, long? respondedBy, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var categoryExists = await _dbContext.FeedbackCategories.AsNoTracking().AnyAsync(x => x.Id == categoryId, cancellationToken);
        if (!categoryExists)
        {
            throw new InvalidOperationException("Feedback category does not exist.");
        }

        if (respondedBy.HasValue)
        {
            var responderExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == respondedBy.Value, cancellationToken);
            if (!responderExists)
            {
                throw new InvalidOperationException("RespondedBy user does not exist.");
            }
        }
    }

    private static void ValidateContent(int rating, string content)
    {
        if (rating < 1 || rating > 5)
        {
            throw new InvalidOperationException("Rating must be in range 1-5.");
        }

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("Content is required.");
        }
    }

    private static FeedbackResponse Map(Feedback entity)
    {
        return new FeedbackResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            CategoryId = entity.CategoryId,
            Rating = entity.Rating,
            Subject = entity.Subject,
            Content = entity.Content,
            Status = entity.Status,
            AdminReply = entity.AdminReply,
            RespondedBy = entity.RespondedBy,
            RespondedAt = entity.RespondedAt,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
