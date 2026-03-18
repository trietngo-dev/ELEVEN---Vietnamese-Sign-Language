namespace EXE101.Application.Models.CourseCategories;

public sealed class CreateCourseCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ColorHex { get; set; }
    public long? IconMediaId { get; set; }
}

public sealed class UpdateCourseCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ColorHex { get; set; }
    public long? IconMediaId { get; set; }
}

public sealed class CourseCategoryResponse
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ColorHex { get; set; }
    public long? IconMediaId { get; set; }
    public DateTime CreatedAt { get; set; }
}
