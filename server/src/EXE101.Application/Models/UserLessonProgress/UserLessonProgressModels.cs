using EXE101.Domain.Enums;

namespace EXE101.Application.Models.UserLessonProgress;

public sealed class CreateUserLessonProgressRequest
{
    public long UserId { get; set; }
    public long LessonId { get; set; }
    public ProgressStatus Status { get; set; } = ProgressStatus.NotStarted;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int LastPositionSeconds { get; set; }
    public int AttemptsCount { get; set; }
    public decimal BestAccuracy { get; set; }
    public decimal BestScore { get; set; }
    public int TotalTimeSeconds { get; set; }
    public int XpEarned { get; set; }
}

public sealed class UpdateUserLessonProgressRequest
{
    public ProgressStatus Status { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int LastPositionSeconds { get; set; }
    public int AttemptsCount { get; set; }
    public decimal BestAccuracy { get; set; }
    public decimal BestScore { get; set; }
    public int TotalTimeSeconds { get; set; }
    public int XpEarned { get; set; }
}

public sealed class UserLessonProgressResponse
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long LessonId { get; set; }
    public ProgressStatus Status { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int LastPositionSeconds { get; set; }
    public int AttemptsCount { get; set; }
    public decimal BestAccuracy { get; set; }
    public decimal BestScore { get; set; }
    public int TotalTimeSeconds { get; set; }
    public int XpEarned { get; set; }
    public DateTime UpdatedAt { get; set; }
}
