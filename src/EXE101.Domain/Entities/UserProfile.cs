namespace EXE101.Domain.Entities;

public sealed class UserProfile
{
    public long UserId { get; set; }
    public string? Phone { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Bio { get; set; }
    public string Timezone { get; set; } = "Asia/Ho_Chi_Minh";
    public string? PreferredSignVariant { get; set; }
    public int CurrentStreakDays { get; set; }
    public int TotalXp { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
