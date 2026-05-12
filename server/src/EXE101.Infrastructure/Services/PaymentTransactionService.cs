using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.PaymentTransactions;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class PaymentTransactionService(
    IPaymentTransactionRepository repository,
    AppDbContext dbContext) : IPaymentTransactionService
{
    private readonly IPaymentTransactionRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<PaymentTransactionResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);

        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<PaymentTransactionResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<PaymentTransactionResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<PaymentTransactionResponse> CreateAsync(CreatePaymentTransactionRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.UserSubscriptionId, cancellationToken);
        ValidateRequest(request.AmountVnd, request.Currency, request.PaymentMethod, request.Status, request.PaidAt);

        var entity = new PaymentTransaction
        {
            UserId = request.UserId,
            UserSubscriptionId = request.UserSubscriptionId,
            AmountVnd = request.AmountVnd,
            Currency = request.Currency.Trim().ToUpperInvariant(),
            PaymentMethod = request.PaymentMethod.Trim(),
            PaymentProvider = request.PaymentProvider,
            ProviderTransactionRef = request.ProviderTransactionRef,
            Status = request.Status,
            PaidAt = request.PaidAt,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<PaymentTransactionResponse?> UpdateAsync(long id, UpdatePaymentTransactionRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await ValidateDependenciesAsync(entity.UserId, request.UserSubscriptionId, cancellationToken);
        ValidateRequest(request.AmountVnd, request.Currency, request.PaymentMethod, request.Status, request.PaidAt);

        entity.UserSubscriptionId = request.UserSubscriptionId;
        entity.AmountVnd = request.AmountVnd;
        entity.Currency = request.Currency.Trim().ToUpperInvariant();
        entity.PaymentMethod = request.PaymentMethod.Trim();
        entity.PaymentProvider = request.PaymentProvider;
        entity.ProviderTransactionRef = request.ProviderTransactionRef;
        entity.Status = request.Status;
        entity.PaidAt = request.PaidAt;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long userId, long? userSubscriptionId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        if (userSubscriptionId.HasValue)
        {
            var subscriptionExists = await _dbContext.UserSubscriptions.AsNoTracking().AnyAsync(x => x.Id == userSubscriptionId.Value, cancellationToken);
            if (!subscriptionExists)
            {
                throw new InvalidOperationException("User subscription does not exist.");
            }
        }
    }

    private static void ValidateRequest(long amountVnd, string currency, string paymentMethod, PaymentStatus status, DateTime? paidAt)
    {
        if (amountVnd < 0)
        {
            throw new InvalidOperationException("AmountVnd must be greater than or equal to zero.");
        }

        if (string.IsNullOrWhiteSpace(currency) || string.IsNullOrWhiteSpace(paymentMethod))
        {
            throw new InvalidOperationException("Currency and PaymentMethod are required.");
        }

        if (status == PaymentStatus.Paid && !paidAt.HasValue)
        {
            throw new InvalidOperationException("PaidAt is required when status is Paid.");
        }
    }

    private static PaymentTransactionResponse Map(PaymentTransaction entity)
    {
        return new PaymentTransactionResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            UserSubscriptionId = entity.UserSubscriptionId,
            AmountVnd = entity.AmountVnd,
            Currency = entity.Currency,
            PaymentMethod = entity.PaymentMethod,
            PaymentProvider = entity.PaymentProvider,
            ProviderTransactionRef = entity.ProviderTransactionRef,
            Status = entity.Status,
            PaidAt = entity.PaidAt,
            CreatedAt = entity.CreatedAt
        };
    }
}
