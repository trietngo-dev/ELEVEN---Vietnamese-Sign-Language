namespace EXE101.Infrastructure.Services;

public sealed class SupabaseStorageOptions
{
    public const string SectionName = "SupabaseStorage";

    public string Url { get; set; } = string.Empty;
    public string ServiceRoleKey { get; set; } = string.Empty;
    public string VideoBucket { get; set; } = "instructional_videos";
    public string ImageBucket { get; set; } = "images";
}
