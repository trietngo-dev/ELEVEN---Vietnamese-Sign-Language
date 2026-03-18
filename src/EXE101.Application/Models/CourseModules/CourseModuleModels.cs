namespace EXE101.Application.Models.CourseModules;

public sealed class CreateCourseModuleRequest
{
    public long CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsPreview { get; set; }
}

public sealed class UpdateCourseModuleRequest
{
    public long CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsPreview { get; set; }
}

public sealed class CourseModuleResponse
{
    public long Id { get; set; }
    public long CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsPreview { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
