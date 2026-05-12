using EXE101.Domain.Enums;

namespace EXE101.Application.Models.Feedbacks;

public sealed class CreateFeedbackRequest
{
    public long UserId { get; set; }
    public long CategoryId { get; set; }
    public int Rating { get; set; }
    public string? Subject { get; set; }
    public string Content { get; set; } = string.Empty;
}

public sealed class UpdateFeedbackRequest
{
    public long CategoryId { get; set; }
    public int Rating { get; set; }
    public string? Subject { get; set; }
    public string Content { get; set; } = string.Empty;
    public FeedbackStatus Status { get; set; }
    public string? AdminReply { get; set; }
    public long? RespondedBy { get; set; }
    public DateTime? RespondedAt { get; set; }
}

public sealed class FeedbackResponse
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long CategoryId { get; set; }
    public int Rating { get; set; }
    public string? Subject { get; set; }
    public string Content { get; set; } = string.Empty;
    public FeedbackStatus Status { get; set; }
    public string? AdminReply { get; set; }
    public long? RespondedBy { get; set; }
    public DateTime? RespondedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
