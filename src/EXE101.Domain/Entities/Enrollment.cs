using EXE101.Domain.Enums;

namespace EXE101.Domain.Entities;

public sealed class Enrollment
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
