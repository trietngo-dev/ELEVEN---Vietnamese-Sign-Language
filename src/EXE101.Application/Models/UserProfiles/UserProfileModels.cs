namespace EXE101.Application.Models.UserProfiles;

public sealed class CreateUserProfileRequest
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
}

public sealed class UpdateUserProfileRequest
{
    public string? Phone { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Bio { get; set; }
    public string Timezone { get; set; } = "Asia/Ho_Chi_Minh";
    public string? PreferredSignVariant { get; set; }
    public int CurrentStreakDays { get; set; }
    public int TotalXp { get; set; }
}

public sealed class UserProfileResponse
{
    public long UserId { get; set; }
    public string? Phone { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Bio { get; set; }
    public string Timezone { get; set; } = string.Empty;
    public string? PreferredSignVariant { get; set; }
    public int CurrentStreakDays { get; set; }
    public int TotalXp { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
