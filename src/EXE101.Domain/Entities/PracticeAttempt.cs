namespace EXE101.Domain.Entities;

public sealed class PracticeAttempt
{
    public long Id { get; set; }
    public long PracticeSessionId { get; set; }
    public long ExpectedVocabularyId { get; set; }
    public long? RecognizedVocabularyId { get; set; }
    public string? ExpectedText { get; set; }
    public string? RecognizedText { get; set; }
    public decimal Confidence { get; set; }
    public bool IsCorrect { get; set; }
    public int? ResponseTimeMs { get; set; }
    public string? FeedbackText { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
