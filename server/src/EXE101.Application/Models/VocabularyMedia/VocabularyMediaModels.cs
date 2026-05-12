namespace EXE101.Application.Models.VocabularyMedia;

public sealed class CreateVocabularyMediaRequest
{
    public long VocabularyId { get; set; }
    public long MediaId { get; set; }
    public string UsageType { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public sealed class UpdateVocabularyMediaRequest
{
    public long VocabularyId { get; set; }
    public long MediaId { get; set; }
    public string UsageType { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public sealed class VocabularyMediaResponse
{
    public long Id { get; set; }
    public long VocabularyId { get; set; }
    public long MediaId { get; set; }
    public string UsageType { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
