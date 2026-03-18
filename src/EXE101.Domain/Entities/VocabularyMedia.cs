namespace EXE101.Domain.Entities;

public sealed class VocabularyMedia
{
    public long Id { get; set; }
    public long VocabularyId { get; set; }
    public long MediaId { get; set; }
    public string UsageType { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
