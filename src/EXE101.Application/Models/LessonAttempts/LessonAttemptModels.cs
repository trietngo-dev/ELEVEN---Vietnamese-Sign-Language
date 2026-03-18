namespace EXE101.Application.Models.LessonAttempts;

public sealed class CreateLessonAttemptRequest
{
    public long UserId { get; set; }
    public long LessonId { get; set; }
    public long? PracticeSessionId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public decimal Accuracy { get; set; }
    public int DurationSeconds { get; set; }
    public int XpEarned { get; set; }
    public bool Passed { get; set; }
    public string CompletionSource { get; set; } = string.Empty;
}

public sealed class UpdateLessonAttemptRequest
{
    public long? PracticeSessionId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public decimal Accuracy { get; set; }
    public int DurationSeconds { get; set; }
    public int XpEarned { get; set; }
    public bool Passed { get; set; }
    public string CompletionSource { get; set; } = string.Empty;
}

public sealed class LessonAttemptResponse
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long LessonId { get; set; }
    public long? PracticeSessionId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public decimal Accuracy { get; set; }
    public int DurationSeconds { get; set; }
    public int XpEarned { get; set; }
    public bool Passed { get; set; }
    public string CompletionSource { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
