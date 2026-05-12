using EXE101.Domain.Enums;

namespace EXE101.Application.Models.Lessons;

public sealed class CreateLessonRequest
{
    public long CourseId { get; set; }
    public long ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? ObjectiveText { get; set; }
    public long? CoverMediaId { get; set; }
    public long? VideoMediaId { get; set; }
    public string LessonType { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = string.Empty;
    public int EstimatedMinutes { get; set; }
    public int XpReward { get; set; }
    public int SortOrder { get; set; }
}

public sealed class UpdateLessonRequest
{
    public long CourseId { get; set; }
    public long ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? ObjectiveText { get; set; }
    public long? CoverMediaId { get; set; }
    public long? VideoMediaId { get; set; }
    public string LessonType { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = string.Empty;
    public int EstimatedMinutes { get; set; }
    public int XpReward { get; set; }
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; }
}

public sealed class LessonResponse
{
    public long Id { get; set; }
    public long CourseId { get; set; }
    public long ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? ObjectiveText { get; set; }
    public long? CoverMediaId { get; set; }
    public long? VideoMediaId { get; set; }
    public string LessonType { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = string.Empty;
    public int EstimatedMinutes { get; set; }
    public int XpReward { get; set; }
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class LessonDetailResponse
{
    public long Id { get; set; }
    public long CourseId { get; set; }
    public long ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? ObjectiveText { get; set; }
    public long? CoverMediaId { get; set; }
    public long? VideoMediaId { get; set; }
    public string? VideoUrl { get; set; }
    public string LessonType { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = string.Empty;
    public int EstimatedMinutes { get; set; }
    public int XpReward { get; set; }
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public sealed class UpdateLessonVideoRequest
{
    public long VideoMediaId { get; set; }
}
