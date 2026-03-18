namespace EXE101.Application.Models.TranslationSegments;

public sealed class CreateTranslationSegmentRequest
{
    public long SessionId { get; set; }
    public int SegmentOrder { get; set; }
    public string RecognizedText { get; set; } = string.Empty;
    public decimal Confidence { get; set; }
    public long? MatchedVocabularyId { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public long? AudioMediaId { get; set; }
    public string? RawPredictionJson { get; set; }
}

public sealed class UpdateTranslationSegmentRequest
{
    public int SegmentOrder { get; set; }
    public string RecognizedText { get; set; } = string.Empty;
    public decimal Confidence { get; set; }
    public long? MatchedVocabularyId { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public long? AudioMediaId { get; set; }
    public string? RawPredictionJson { get; set; }
}

public sealed class TranslationSegmentResponse
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
