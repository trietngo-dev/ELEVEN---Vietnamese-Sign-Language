namespace EXE101.Application.Models.UserSettings;

public sealed class UpdateUserSettingRequest
{
    public bool NotificationsEnabled { get; set; }
    public bool MarketingEmailsEnabled { get; set; }
    public bool TranslationAutoSpeak { get; set; }
    public decimal PlaybackSpeed { get; set; }
    public int DailyGoalMinutes { get; set; }
    public string Theme { get; set; } = "light";
}

public sealed class UserSettingResponse
{
    public long UserId { get; set; }
    public bool NotificationsEnabled { get; set; }
    public bool MarketingEmailsEnabled { get; set; }
    public bool TranslationAutoSpeak { get; set; }
    public decimal PlaybackSpeed { get; set; }
    public int DailyGoalMinutes { get; set; }
    public string Theme { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
