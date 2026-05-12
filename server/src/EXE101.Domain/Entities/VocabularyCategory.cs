namespace EXE101.Domain.Entities;

public sealed class VocabularyCategory
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
