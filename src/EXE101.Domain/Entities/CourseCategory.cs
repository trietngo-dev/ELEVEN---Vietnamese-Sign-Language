namespace EXE101.Domain.Entities;

public sealed class CourseCategory
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ColorHex { get; set; }
    public long? IconMediaId { get; set; }
    public DateTime CreatedAt { get; set; }
}
