namespace EXE101.Domain.Entities;

public sealed class UserSetting
{
    public long UserId { get; set; }
    public bool NotificationsEnabled { get; set; }
    public bool MarketingEmailsEnabled { get; set; }
    public bool TranslationAutoSpeak { get; set; }
    public decimal PlaybackSpeed { get; set; }
    public int DailyGoalMinutes { get; set; }
    public string Theme { get; set; } = "light";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
