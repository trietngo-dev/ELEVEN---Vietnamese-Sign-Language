using EXE101.Domain.Enums;

namespace EXE101.Domain.Entities;

public sealed class UserVocabularyProgress
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long VocabularyId { get; set; }
    public ProgressStatus Status { get; set; }
    public DateTime? FirstLearnedAt { get; set; }
    public DateTime? LastPracticedAt { get; set; }
    public decimal MasteryLevel { get; set; }
    public int TotalPracticeCount { get; set; }
    public int CorrectCount { get; set; }
    public decimal BestConfidence { get; set; }
    public bool IsSaved { get; set; }
    public DateTime UpdatedAt { get; set; }
}
