using EXE101.Domain.Enums;

namespace EXE101.Application.Models.PracticeSessions;

public sealed class CreatePracticeSessionRequest
{
    public long UserId { get; set; }
    public long? CourseId { get; set; }
    public long? LessonId { get; set; }
    public long? VocabularyId { get; set; }
    public string Mode { get; set; } = string.Empty;
    public string? PromptText { get; set; }
    public int TotalItems { get; set; }
}

public sealed class UpdatePracticeSessionRequest
{
    public SessionStatus Status { get; set; }
    public int TotalItems { get; set; }
    public int CorrectItems { get; set; }
    public decimal Accuracy { get; set; }
    public DateTime? EndedAt { get; set; }
    public string? Notes { get; set; }
}

public sealed class PracticeSessionResponse
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long? CourseId { get; set; }
    public long? LessonId { get; set; }
    public long? VocabularyId { get; set; }
    public string Mode { get; set; } = string.Empty;
    public string? PromptText { get; set; }
    public SessionStatus Status { get; set; }
    public int TotalItems { get; set; }
    public int CorrectItems { get; set; }
    public decimal Accuracy { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public string? Notes { get; set; }
}
