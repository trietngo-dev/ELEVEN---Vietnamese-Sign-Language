using EXE101.Application.Interfaces.Repositories;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Repositories;

public sealed class MediaAssetRepository(AppDbContext dbContext) : IMediaAssetRepository
{
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<IReadOnlyList<MediaAsset>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        return await _dbContext.MediaAssets
            .AsNoTracking()
            .OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(CancellationToken cancellationToken = default)
        => _dbContext.MediaAssets.AsNoTracking().CountAsync(cancellationToken);

    public Task<MediaAsset?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
        => _dbContext.MediaAssets.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<MediaAsset> AddAsync(MediaAsset entity, CancellationToken cancellationToken = default)
    {
        _dbContext.MediaAssets.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<MediaAsset> UpdateAsync(MediaAsset entity, CancellationToken cancellationToken = default)
    {
        _dbContext.MediaAssets.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }
}
