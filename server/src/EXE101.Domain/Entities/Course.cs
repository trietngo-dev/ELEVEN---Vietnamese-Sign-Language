using EXE101.Domain.Enums;

namespace EXE101.Domain.Entities;

public sealed class Course
{
    public long Id { get; set; }
    public long CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? Description { get; set; }
    public string Level { get; set; } = string.Empty;
    public long? CoverMediaId { get; set; }
    public long? TrailerMediaId { get; set; }
    public bool IsPremium { get; set; }
    public ContentStatus Status { get; set; }
    public DateTime? PublishedAt { get; set; }
    public long CreatedBy { get; set; }
    public long? UpdatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
