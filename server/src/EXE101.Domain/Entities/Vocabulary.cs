using EXE101.Domain.Enums;

namespace EXE101.Domain.Entities;

public sealed class Vocabulary
{
    public long Id { get; set; }
    public long CategoryId { get; set; }
    public string? Code { get; set; }
    public string TermVi { get; set; } = string.Empty;
    public string NormalizedTerm { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? UsageExample { get; set; }
    public string DifficultyLevel { get; set; } = string.Empty;
    public string? HandHintText { get; set; }
    public bool IsFeatured { get; set; }
    public ContentStatus Status { get; set; }
    public long CreatedBy { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
