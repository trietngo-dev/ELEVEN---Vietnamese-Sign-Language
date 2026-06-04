using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserLessonProgress;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class UserLessonProgressService(
    IUserLessonProgressRepository repository,
    AppDbContext dbContext) : IUserLessonProgressService
{
    private readonly IUserLessonProgressRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<UserLessonProgressResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);

        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        var lessonIds = entities.Select(e => e.LessonId).Distinct().ToList();
        var lessonCourseDict = await _dbContext.Lessons
            .AsNoTracking()
            .Where(l => lessonIds.Contains(l.Id))
            .ToDictionaryAsync(l => l.Id, l => l.CourseId, cancellationToken);

        return new PagedResult<UserLessonProgressResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(e => Map(e, lessonCourseDict.GetValueOrDefault(e.LessonId))).ToList()
        };
    }

    public async Task<UserLessonProgressResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null) return null;
        var lesson = await _dbContext.Lessons.AsNoTracking().FirstOrDefaultAsync(l => l.Id == entity.LessonId, cancellationToken);
        return Map(entity, lesson?.CourseId ?? 0);
    }

    public async Task<UserLessonProgressResponse> CreateAsync(CreateUserLessonProgressRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.LessonId, cancellationToken);
        ValidateMetrics(request.LastPositionSeconds, request.AttemptsCount, request.BestAccuracy, request.BestScore, request.TotalTimeSeconds, request.XpEarned);

        var exists = await _repository.ExistsByUserAndLessonAsync(request.UserId, request.LessonId, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("User lesson progress already exists.");
        }

        var entity = new UserLessonProgress
        {
            UserId = request.UserId,
            LessonId = request.LessonId,
            Status = request.Status,
            StartedAt = request.StartedAt,
            CompletedAt = request.CompletedAt,
            LastPositionSeconds = request.LastPositionSeconds,
            AttemptsCount = request.AttemptsCount,
            BestAccuracy = request.BestAccuracy,
            BestScore = request.BestScore,
            TotalTimeSeconds = request.TotalTimeSeconds,
            XpEarned = request.XpEarned,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        await SyncEnrollmentProgressAsync(request.UserId, request.LessonId, request.Status, cancellationToken);
        await AddXpToUserProfileAsync(request.UserId, request.XpEarned, cancellationToken);
        var lesson = await _dbContext.Lessons.AsNoTracking().FirstOrDefaultAsync(l => l.Id == created.LessonId, cancellationToken);
        return Map(created, lesson?.CourseId ?? 0);
    }

    public async Task<UserLessonProgressResponse?> UpdateAsync(long id, UpdateUserLessonProgressRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateMetrics(request.LastPositionSeconds, request.AttemptsCount, request.BestAccuracy, request.BestScore, request.TotalTimeSeconds, request.XpEarned);

        var oldXp = entity.XpEarned;
        entity.Status = request.Status;
        entity.StartedAt = request.StartedAt;
        entity.CompletedAt = request.CompletedAt;
        entity.LastPositionSeconds = request.LastPositionSeconds;
        entity.AttemptsCount = request.AttemptsCount;
        entity.BestAccuracy = request.BestAccuracy;
        entity.BestScore = request.BestScore;
        entity.TotalTimeSeconds = request.TotalTimeSeconds;
        entity.XpEarned = request.XpEarned;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        await SyncEnrollmentProgressAsync(entity.UserId, entity.LessonId, request.Status, cancellationToken);
        if (request.XpEarned > oldXp)
        {
            await AddXpToUserProfileAsync(entity.UserId, request.XpEarned - oldXp, cancellationToken);
        }
        var lesson = await _dbContext.Lessons.AsNoTracking().FirstOrDefaultAsync(l => l.Id == updated.LessonId, cancellationToken);
        return Map(updated, lesson?.CourseId ?? 0);
    }

    public async Task<UserLessonProgressResponse> UpsertAsync(CreateUserLessonProgressRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.LessonId, cancellationToken);
        ValidateMetrics(request.LastPositionSeconds, request.AttemptsCount, request.BestAccuracy, request.BestScore, request.TotalTimeSeconds, request.XpEarned);

        UserLessonProgress resultEntity;
        var existing = await _repository.GetByUserAndLessonAsync(request.UserId, request.LessonId, cancellationToken);
        if (existing != null)
        {
            existing.Status = request.Status;
            if (request.StartedAt.HasValue) existing.StartedAt = request.StartedAt;
            if (request.CompletedAt.HasValue) existing.CompletedAt = request.CompletedAt;
            existing.LastPositionSeconds = request.LastPositionSeconds;
            
            existing.AttemptsCount += request.AttemptsCount;
            if (request.BestAccuracy > existing.BestAccuracy) existing.BestAccuracy = request.BestAccuracy;
            if (request.BestScore > existing.BestScore) existing.BestScore = request.BestScore;
            
            var oldXp = existing.XpEarned;
            existing.TotalTimeSeconds += request.TotalTimeSeconds;
            if (request.XpEarned > existing.XpEarned) existing.XpEarned = request.XpEarned;
            
            existing.UpdatedAt = DateTime.UtcNow;

            resultEntity = await _repository.UpdateAsync(existing, cancellationToken);
            if (resultEntity.XpEarned > oldXp)
            {
                await AddXpToUserProfileAsync(request.UserId, resultEntity.XpEarned - oldXp, cancellationToken);
            }
        }
        else
        {
            var entity = new UserLessonProgress
            {
                UserId = request.UserId,
                LessonId = request.LessonId,
                Status = request.Status,
                StartedAt = request.StartedAt,
                CompletedAt = request.CompletedAt,
                LastPositionSeconds = request.LastPositionSeconds,
                AttemptsCount = request.AttemptsCount > 0 ? request.AttemptsCount : 1,
                BestAccuracy = request.BestAccuracy,
                BestScore = request.BestScore,
                TotalTimeSeconds = request.TotalTimeSeconds,
                XpEarned = request.XpEarned,
                UpdatedAt = DateTime.UtcNow
            };

            resultEntity = await _repository.AddAsync(entity, cancellationToken);
            await AddXpToUserProfileAsync(request.UserId, resultEntity.XpEarned, cancellationToken);
        }

        await SyncEnrollmentProgressAsync(request.UserId, request.LessonId, request.Status, cancellationToken);
        var lesson = await _dbContext.Lessons.AsNoTracking().FirstOrDefaultAsync(l => l.Id == resultEntity.LessonId, cancellationToken);
        return Map(resultEntity, lesson?.CourseId ?? 0);
    }

    public async Task<IReadOnlyList<UserLessonProgressResponse>> GetByUserAndCourseAsync(long userId, long courseId, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetByUserAndCourseAsync(userId, courseId, cancellationToken);
        return entities.Select(e => Map(e, courseId)).ToList();
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long userId, long lessonId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var lessonExists = await _dbContext.Lessons.AsNoTracking().AnyAsync(x => x.Id == lessonId, cancellationToken);
        if (!lessonExists)
        {
            throw new InvalidOperationException("Lesson does not exist.");
        }
    }

    private static void ValidateMetrics(int lastPositionSeconds, int attemptsCount, decimal bestAccuracy, decimal bestScore, int totalTimeSeconds, int xpEarned)
    {
        if (lastPositionSeconds < 0 || attemptsCount < 0 || totalTimeSeconds < 0 || xpEarned < 0)
        {
            throw new InvalidOperationException("Numeric metrics must be greater than or equal to zero.");
        }

        if (bestAccuracy < 0 || bestAccuracy > 100)
        {
            throw new InvalidOperationException("BestAccuracy must be in range 0-100.");
        }

        if (bestScore < 0)
        {
            throw new InvalidOperationException("BestScore must be greater than or equal to zero.");
        }
    }

    private async Task SyncEnrollmentProgressAsync(long userId, long lessonId, ProgressStatus status, CancellationToken cancellationToken)
    {
        var lesson = await _dbContext.Lessons.AsNoTracking().FirstOrDefaultAsync(l => l.Id == lessonId, cancellationToken);
        if (lesson == null) return;

        var enrollment = await _dbContext.Enrollments
            .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == lesson.CourseId, cancellationToken);

        if (enrollment == null)
        {
            var now = DateTime.UtcNow;
            enrollment = new Enrollment
            {
                UserId = userId,
                CourseId = lesson.CourseId,
                Status = EnrollmentStatus.Enrolled,
                EnrolledAt = now,
                CreatedAt = now,
                UpdatedAt = now,
                ProgressPercent = 0
            };
            _dbContext.Enrollments.Add(enrollment);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        // Recalculate progress percent
        var courseLessons = await _dbContext.Lessons.AsNoTracking().Where(l => l.CourseId == lesson.CourseId).ToListAsync(cancellationToken);
        var courseLessonIds = courseLessons.Select(cl => cl.Id).ToList();
        var completedCount = await _dbContext.UserLessonProgresses
            .AsNoTracking()
            .CountAsync(ulp => ulp.UserId == userId && courseLessonIds.Contains(ulp.LessonId) && ulp.Status == ProgressStatus.Completed, cancellationToken);

        var progressPercent = courseLessons.Count > 0 ? Math.Round(((decimal)completedCount / courseLessons.Count) * 100, 2) : 0;

        enrollment.ProgressPercent = progressPercent;
        enrollment.CurrentLessonId = lesson.Id;
        enrollment.CurrentModuleId = lesson.ModuleId;
        
        if (enrollment.StartedAt == null)
        {
            enrollment.StartedAt = DateTime.UtcNow;
        }

        if (progressPercent >= 100)
        {
            enrollment.Status = EnrollmentStatus.Completed;
            enrollment.CompletedAt ??= DateTime.UtcNow;
        }
        else
        {
            enrollment.Status = EnrollmentStatus.InProgress;
            enrollment.CompletedAt = null;
        }

        enrollment.UpdatedAt = DateTime.UtcNow;
        _dbContext.Enrollments.Update(enrollment);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static UserLessonProgressResponse Map(UserLessonProgress entity, long courseId)
    {
        return new UserLessonProgressResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            LessonId = entity.LessonId,
            CourseId = courseId,
            Status = entity.Status,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
            LastPositionSeconds = entity.LastPositionSeconds,
            AttemptsCount = entity.AttemptsCount,
            BestAccuracy = entity.BestAccuracy,
            BestScore = entity.BestScore,
            TotalTimeSeconds = entity.TotalTimeSeconds,
            XpEarned = entity.XpEarned,
            UpdatedAt = entity.UpdatedAt
        };
    }

    private async Task AddXpToUserProfileAsync(long userId, int xpToAdd, CancellationToken cancellationToken)
    {
        if (xpToAdd <= 0) return;
        var profile = await _dbContext.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (profile == null)
        {
            var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
            if (userExists)
            {
                var now = DateTime.UtcNow;
                profile = new UserProfile
                {
                    UserId = userId,
                    Timezone = "Asia/Ho_Chi_Minh",
                    TotalXp = xpToAdd,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                _dbContext.UserProfiles.Add(profile);
            }
        }
        else
        {
            profile.TotalXp += xpToAdd;
            profile.UpdatedAt = DateTime.UtcNow;
            _dbContext.UserProfiles.Update(profile);
        }
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
