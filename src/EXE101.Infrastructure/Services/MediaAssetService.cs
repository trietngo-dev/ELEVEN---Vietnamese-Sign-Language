using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.MediaAssets;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class MediaAssetService(
    IMediaAssetRepository repository,
    AppDbContext dbContext) : IMediaAssetService
{
    private readonly IMediaAssetRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<MediaAssetResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetPagedAsync(page, pageSize, cancellationToken);
        var total = await _repository.CountAsync(cancellationToken);

        return new PagedResult<MediaAssetResponse>
        {
            Page = Math.Max(1, page),
            PageSize = Math.Clamp(pageSize, 1, 200),
            Total = total,
            Items = items.Select(Map).ToList()
        };
    }

    public async Task<MediaAssetResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
        {
            throw new InvalidOperationException("Id must be greater than zero.");
        }

        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<MediaAssetResponse> CreateAsync(CreateMediaAssetRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateOwnerAsync(request.OwnerUserId, cancellationToken);
        ValidatePayload(request.StorageProvider, request.FileName, request.FileUrl, request.MimeType, request.MediaType, request.FileSizeBytes);

        var entity = new MediaAsset
        {
            OwnerUserId = request.OwnerUserId,
            StorageProvider = request.StorageProvider.Trim(),
            FileName = request.FileName.Trim(),
            FileUrl = request.FileUrl.Trim(),
            MimeType = request.MimeType.Trim(),
            MediaType = request.MediaType.Trim(),
            FileSizeBytes = request.FileSizeBytes,
            DurationSeconds = request.DurationSeconds,
            Width = request.Width,
            Height = request.Height,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<MediaAssetResponse?> UpdateAsync(long id, UpdateMediaAssetRequest request, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
        {
            throw new InvalidOperationException("Id must be greater than zero.");
        }

        ValidatePayload(request.StorageProvider, request.FileName, request.FileUrl, request.MimeType, request.MediaType, request.FileSizeBytes);

        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        entity.StorageProvider = request.StorageProvider.Trim();
        entity.FileName = request.FileName.Trim();
        entity.FileUrl = request.FileUrl.Trim();
        entity.MimeType = request.MimeType.Trim();
        entity.MediaType = request.MediaType.Trim();
        entity.FileSizeBytes = request.FileSizeBytes;
        entity.DurationSeconds = request.DurationSeconds;
        entity.Width = request.Width;
        entity.Height = request.Height;
        entity.Status = request.Status;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public async Task<MediaAssetResponse?> ArchiveAsync(long id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
        {
            throw new InvalidOperationException("Id must be greater than zero.");
        }

        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        entity.Status = MediaStatus.Archived;
        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    private async Task ValidateOwnerAsync(long? ownerUserId, CancellationToken cancellationToken)
    {
        if (!ownerUserId.HasValue)
        {
            return;
        }

        if (ownerUserId.Value <= 0)
        {
            throw new InvalidOperationException("OwnerUserId must be greater than zero.");
        }

        var ownerExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == ownerUserId.Value, cancellationToken);
        if (!ownerExists)
        {
            throw new InvalidOperationException("Owner user does not exist.");
        }
    }

    private static void ValidatePayload(
        string storageProvider,
        string fileName,
        string fileUrl,
        string mimeType,
        string mediaType,
        long fileSizeBytes)
    {
        if (string.IsNullOrWhiteSpace(storageProvider))
        {
            throw new InvalidOperationException("StorageProvider is required.");
        }

        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new InvalidOperationException("FileName is required.");
        }

        if (string.IsNullOrWhiteSpace(fileUrl))
        {
            throw new InvalidOperationException("FileUrl is required.");
        }

        if (string.IsNullOrWhiteSpace(mimeType))
        {
            throw new InvalidOperationException("MimeType is required.");
        }

        if (string.IsNullOrWhiteSpace(mediaType))
        {
            throw new InvalidOperationException("MediaType is required.");
        }

        if (fileSizeBytes < 0)
        {
            throw new InvalidOperationException("FileSizeBytes must be greater than or equal to zero.");
        }
    }

    private static MediaAssetResponse Map(MediaAsset entity)
    {
        return new MediaAssetResponse
        {
            Id = entity.Id,
            OwnerUserId = entity.OwnerUserId,
            StorageProvider = entity.StorageProvider,
            FileName = entity.FileName,
            FileUrl = entity.FileUrl,
            MimeType = entity.MimeType,
            MediaType = entity.MediaType,
            FileSizeBytes = entity.FileSizeBytes,
            DurationSeconds = entity.DurationSeconds,
            Width = entity.Width,
            Height = entity.Height,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt
        };
    }
}
