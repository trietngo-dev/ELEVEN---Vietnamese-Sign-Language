using EXE101.Domain.Enums;

namespace EXE101.Application.Models.Enrollments;

public sealed class EnrollCourseRequest
{
    public long UserId { get; set; }
    public long CourseId { get; set; }
}

public sealed class UpdateEnrollmentProgressRequest
{
    public long? CurrentModuleId { get; set; }
    public long? CurrentLessonId { get; set; }
    public decimal ProgressPercent { get; set; }
}

public sealed class CompleteEnrollmentRequest
{
    public decimal ProgressPercent { get; set; } = 100;
}

public sealed class EnrollmentResponse
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long CourseId { get; set; }
    public EnrollmentStatus Status { get; set; }
    public DateTime EnrolledAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public long? CurrentModuleId { get; set; }
    public long? CurrentLessonId { get; set; }
    public decimal ProgressPercent { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
