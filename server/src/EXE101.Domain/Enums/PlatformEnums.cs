namespace EXE101.Domain.Enums;

public enum UserStatus
{
    Active,
    Inactive,
    Suspended,
    Pending
}

public enum AuthProvider
{
    Email,
    Google,
    Apple
}

public enum MediaStatus
{
    Uploaded,
    Processing,
    Ready,
    Failed,
    Archived
}

public enum ContentStatus
{
    Draft,
    Published,
    Archived
}

public enum EnrollmentStatus
{
    Enrolled,
    InProgress,
    Completed,
    Cancelled
}

public enum ProgressStatus
{
    NotStarted,
    InProgress,
    Completed
}

public enum SessionStatus
{
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled
}

public enum SubscriptionStatus
{
    Active,
    Cancelled,
    Expired,
    Paused
}

public enum PaymentStatus
{
    Pending,
    Paid,
    Failed,
    Refunded,
    Cancelled
}

public enum FeedbackStatus
{
    New,
    InReview,
    Responded,
    Closed
}

public enum BadgeType
{
    Achievement,
    Milestone,
    Course,
    Streak,
    Custom
}
