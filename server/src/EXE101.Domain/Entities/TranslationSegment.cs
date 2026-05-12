namespace EXE101.Domain.Entities;

public sealed class TranslationSegment
{
    public long Id { get; set; }
    public long SessionId { get; set; }
    public int SegmentOrder { get; set; }
    public string RecognizedText { get; set; } = string.Empty;
    public string? NormalizedText { get; set; }
    public decimal Confidence { get; set; }
    public long? MatchedVocabularyId { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public long? AudioMediaId { get; set; }
    public string? RawPredictionJson { get; set; }
    public DateTime CreatedAt { get; set; }
}
