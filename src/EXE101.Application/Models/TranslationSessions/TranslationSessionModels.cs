using EXE101.Domain.Enums;

namespace EXE101.Application.Models.TranslationSessions;

public sealed class CreateTranslationSessionRequest
{
    public long? UserId { get; set; }
    public string InputMode { get; set; } = string.Empty;
    public string OutputMode { get; set; } = string.Empty;
    public string? SignVariantUsed { get; set; }
}

public sealed class UpdateTranslationSessionRequest
{
    public SessionStatus Status { get; set; }
    public string? FinalText { get; set; }
    public long? FinalAudioMediaId { get; set; }
    public decimal AverageConfidence { get; set; }
    public DateTime? EndedAt { get; set; }
}

public sealed class TranslationSessionResponse
{
    public long Id { get; set; }
    public long? UserId { get; set; }
    public string InputMode { get; set; } = string.Empty;
    public string OutputMode { get; set; } = string.Empty;
    public string? SignVariantUsed { get; set; }
    public SessionStatus Status { get; set; }
    public string? FinalText { get; set; }
    public long? FinalAudioMediaId { get; set; }
    public decimal AverageConfidence { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
}
