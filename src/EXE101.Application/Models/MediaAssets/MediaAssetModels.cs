using EXE101.Domain.Enums;

namespace EXE101.Application.Models.MediaAssets;

public sealed class CreateMediaAssetRequest
{
    public long? OwnerUserId { get; set; }
    public string StorageProvider { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public int? DurationSeconds { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public MediaStatus Status { get; set; } = MediaStatus.Uploaded;
}

public sealed class UpdateMediaAssetRequest
{
    public string StorageProvider { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public int? DurationSeconds { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public MediaStatus Status { get; set; } = MediaStatus.Uploaded;
}

public sealed class MediaAssetResponse
{
    public long Id { get; set; }
    public long? OwnerUserId { get; set; }
    public string StorageProvider { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public int? DurationSeconds { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public MediaStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class UploadMediaAssetRequest
{
    public long? OwnerUserId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public int? DurationSeconds { get; set; }
}

public sealed class UploadMediaAssetResponse
{
    public long Id { get; set; }
    public string FileUrl { get; set; } = string.Empty;
}
