using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface IMediaAssetRepository
{
    Task<IReadOnlyList<MediaAsset>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<MediaAsset?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<MediaAsset> AddAsync(MediaAsset entity, CancellationToken cancellationToken = default);
    Task<MediaAsset> UpdateAsync(MediaAsset entity, CancellationToken cancellationToken = default);
}
