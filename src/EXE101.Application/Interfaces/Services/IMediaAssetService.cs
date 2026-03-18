using EXE101.Application.Models.Common;
using EXE101.Application.Models.MediaAssets;

namespace EXE101.Application.Interfaces.Services;

public interface IMediaAssetService
{
    Task<PagedResult<MediaAssetResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<MediaAssetResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<MediaAssetResponse> CreateAsync(CreateMediaAssetRequest request, CancellationToken cancellationToken = default);
    Task<MediaAssetResponse?> UpdateAsync(long id, UpdateMediaAssetRequest request, CancellationToken cancellationToken = default);
    Task<MediaAssetResponse?> ArchiveAsync(long id, CancellationToken cancellationToken = default);
}
