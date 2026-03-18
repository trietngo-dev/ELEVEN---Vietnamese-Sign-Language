using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class PaymentTransactionRepository(AppDbContext dbContext) : IPaymentTransactionRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<PaymentTransaction>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.PaymentTransactions
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.PaymentTransactions.AsNoTracking().CountAsync(cancellationToken);

    public Task<PaymentTransaction?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.PaymentTransactions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<PaymentTransaction> AddAsync(PaymentTransaction entity, CancellationToken cancellationToken = default)
    {
        _dbContext.PaymentTransactions.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<PaymentTransaction> UpdateAsync(PaymentTransaction entity, CancellationToken cancellationToken = default)
    {
        _dbContext.PaymentTransactions.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.PaymentTransactions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        _dbContext.PaymentTransactions.Remove(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
