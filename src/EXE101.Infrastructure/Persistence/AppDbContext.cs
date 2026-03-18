using EXE101.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<AuthAccount> AuthAccounts => Set<AuthAccount>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserSetting> UserSettings => Set<UserSetting>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<CourseCategory> CourseCategories => Set<CourseCategory>();
    public DbSet<VocabularyCategory> VocabularyCategories => Set<VocabularyCategory>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseModule> CourseModules => Set<CourseModule>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Vocabulary> Vocabularies => Set<Vocabulary>();
    public DbSet<VocabularyMedia> VocabularyMedias => Set<VocabularyMedia>();
    public DbSet<LessonVocabulary> LessonVocabularies => Set<LessonVocabulary>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<UserLessonProgress> UserLessonProgresses => Set<UserLessonProgress>();
    public DbSet<LessonAttempt> LessonAttempts => Set<LessonAttempt>();
    public DbSet<UserVocabularyProgress> UserVocabularyProgresses => Set<UserVocabularyProgress>();
    public DbSet<TranslationSession> TranslationSessions => Set<TranslationSession>();
    public DbSet<TranslationSegment> TranslationSegments => Set<TranslationSegment>();
    public DbSet<PracticeSession> PracticeSessions => Set<PracticeSession>();
    public DbSet<PracticeAttempt> PracticeAttempts => Set<PracticeAttempt>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<UserSubscription> UserSubscriptions => Set<UserSubscription>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<FeedbackCategory> FeedbackCategories => Set<FeedbackCategory>();
    public DbSet<Feedback> Feedbacks => Set<Feedback>();
    public DbSet<Badge> Badges => Set<Badge>();
    public DbSet<UserBadge> UserBadges => Set<UserBadge>();
    public DbSet<UserActivityLog> UserActivityLogs => Set<UserActivityLog>();
    public DbSet<AdminActionLog> AdminActionLogs => Set<AdminActionLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>().ToTable("roles");
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<AuthAccount>().ToTable("auth_accounts");
        modelBuilder.Entity<UserProfile>().ToTable("user_profiles");
        modelBuilder.Entity<UserSetting>().ToTable("user_settings");
        modelBuilder.Entity<MediaAsset>().ToTable("media_assets");
        modelBuilder.Entity<CourseCategory>().ToTable("course_categories");
        modelBuilder.Entity<VocabularyCategory>().ToTable("vocabulary_categories");
        modelBuilder.Entity<Course>().ToTable("courses");
        modelBuilder.Entity<CourseModule>().ToTable("course_modules");
        modelBuilder.Entity<Lesson>().ToTable("lessons");
        modelBuilder.Entity<Vocabulary>().ToTable("vocabularies");
        modelBuilder.Entity<VocabularyMedia>().ToTable("vocabulary_media");
        modelBuilder.Entity<LessonVocabulary>().ToTable("lesson_vocabularies");
        modelBuilder.Entity<Enrollment>().ToTable("enrollments");
        modelBuilder.Entity<UserLessonProgress>().ToTable("user_lesson_progress");
        modelBuilder.Entity<LessonAttempt>().ToTable("lesson_attempts");
        modelBuilder.Entity<UserVocabularyProgress>().ToTable("user_vocabulary_progress");
        modelBuilder.Entity<TranslationSession>().ToTable("translation_sessions");
        modelBuilder.Entity<TranslationSegment>().ToTable("translation_segments");
        modelBuilder.Entity<PracticeSession>().ToTable("practice_sessions");
        modelBuilder.Entity<PracticeAttempt>().ToTable("practice_attempts");
        modelBuilder.Entity<SubscriptionPlan>().ToTable("subscription_plans");
        modelBuilder.Entity<UserSubscription>().ToTable("user_subscriptions");
        modelBuilder.Entity<PaymentTransaction>().ToTable("payment_transactions");
        modelBuilder.Entity<Notification>().ToTable("notifications");
        modelBuilder.Entity<FeedbackCategory>().ToTable("feedback_categories");
        modelBuilder.Entity<Feedback>().ToTable("feedbacks");
        modelBuilder.Entity<Badge>().ToTable("badges");
        modelBuilder.Entity<UserBadge>().ToTable("user_badges");
        modelBuilder.Entity<UserActivityLog>().ToTable("user_activity_logs");
        modelBuilder.Entity<AdminActionLog>().ToTable("admin_action_logs");

        modelBuilder.Entity<Role>().HasKey(x => x.Id);

        modelBuilder.Entity<Role>()
            .Property(x => x.Code)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<Role>()
            .Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Role>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<Role>()
            .HasIndex(x => x.Code)
            .IsUnique();

        modelBuilder.Entity<User>().HasKey(x => x.Id);

        modelBuilder.Entity<User>()
            .Property(x => x.Email)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(x => x.PasswordHash)
            .HasMaxLength(255);

        modelBuilder.Entity<User>()
            .Property(x => x.FullName)
            .HasMaxLength(150)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<User>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasOne<Role>()
            .WithMany()
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<AuthAccount>().HasKey(x => x.Id);

        modelBuilder.Entity<AuthAccount>()
            .Property(x => x.Provider)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<AuthAccount>()
            .Property(x => x.ProviderUserId)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<AuthAccount>()
            .Property(x => x.ProviderEmail)
            .HasMaxLength(255);

        modelBuilder.Entity<AuthAccount>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<AuthAccount>()
            .HasIndex(x => new { x.Provider, x.ProviderUserId })
            .IsUnique();

        modelBuilder.Entity<AuthAccount>()
            .HasIndex(x => x.UserId);

        modelBuilder.Entity<AuthAccount>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserProfile>().HasKey(x => x.UserId);

        modelBuilder.Entity<UserProfile>()
            .Property(x => x.Phone)
            .HasMaxLength(30);

        modelBuilder.Entity<UserProfile>()
            .Property(x => x.Gender)
            .HasMaxLength(20);

        modelBuilder.Entity<UserProfile>()
            .Property(x => x.Timezone)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<UserProfile>()
            .Property(x => x.PreferredSignVariant)
            .HasMaxLength(50);

        modelBuilder.Entity<UserProfile>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<UserProfile>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<UserProfile>()
            .HasOne<User>()
            .WithOne()
            .HasForeignKey<UserProfile>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserSetting>().HasKey(x => x.UserId);

        modelBuilder.Entity<UserSetting>()
            .Property(x => x.Theme)
            .HasMaxLength(20)
            .IsRequired();

        modelBuilder.Entity<UserSetting>()
            .Property(x => x.PlaybackSpeed)
            .HasPrecision(4, 2)
            .IsRequired();

        modelBuilder.Entity<UserSetting>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<UserSetting>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<UserSetting>()
            .HasOne<User>()
            .WithOne()
            .HasForeignKey<UserSetting>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MediaAsset>().HasKey(x => x.Id);

        modelBuilder.Entity<MediaAsset>()
            .Property(x => x.StorageProvider)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<MediaAsset>()
            .Property(x => x.FileName)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<MediaAsset>()
            .Property(x => x.FileUrl)
            .IsRequired();

        modelBuilder.Entity<MediaAsset>()
            .Property(x => x.MimeType)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<MediaAsset>()
            .Property(x => x.MediaType)
            .HasMaxLength(30)
            .IsRequired();

        modelBuilder.Entity<MediaAsset>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<MediaAsset>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<MediaAsset>()
            .HasIndex(x => x.OwnerUserId);

        modelBuilder.Entity<MediaAsset>()
            .HasIndex(x => x.Status);

        modelBuilder.Entity<MediaAsset>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.OwnerUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<CourseCategory>().HasKey(x => x.Id);

        modelBuilder.Entity<CourseCategory>()
            .Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<CourseCategory>()
            .Property(x => x.Slug)
            .HasMaxLength(120)
            .IsRequired();

        modelBuilder.Entity<CourseCategory>()
            .Property(x => x.ColorHex)
            .HasMaxLength(10);

        modelBuilder.Entity<CourseCategory>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<CourseCategory>()
            .HasIndex(x => x.Slug)
            .IsUnique();

        modelBuilder.Entity<CourseCategory>()
            .HasOne<MediaAsset>()
            .WithMany()
            .HasForeignKey(x => x.IconMediaId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<VocabularyCategory>().HasKey(x => x.Id);

        modelBuilder.Entity<VocabularyCategory>()
            .Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<VocabularyCategory>()
            .Property(x => x.Slug)
            .HasMaxLength(120)
            .IsRequired();

        modelBuilder.Entity<VocabularyCategory>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<VocabularyCategory>()
            .HasIndex(x => x.Slug)
            .IsUnique();

        modelBuilder.Entity<Course>().HasKey(x => x.Id);

        modelBuilder.Entity<Course>()
            .Property(x => x.Title)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<Course>()
            .Property(x => x.Slug)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<Course>()
            .Property(x => x.Level)
            .HasMaxLength(30)
            .IsRequired();

        modelBuilder.Entity<Course>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<Course>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<Course>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<Course>()
            .HasIndex(x => x.Slug)
            .IsUnique();

        modelBuilder.Entity<Course>()
            .HasOne<CourseCategory>()
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Course>()
            .HasOne<MediaAsset>()
            .WithMany()
            .HasForeignKey(x => x.CoverMediaId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Course>()
            .HasOne<MediaAsset>()
            .WithMany()
            .HasForeignKey(x => x.TrailerMediaId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Course>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Course>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UpdatedBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<CourseModule>().HasKey(x => x.Id);

        modelBuilder.Entity<CourseModule>()
            .Property(x => x.Title)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<CourseModule>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<CourseModule>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<CourseModule>()
            .HasOne<Course>()
            .WithMany()
            .HasForeignKey(x => x.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Lesson>().HasKey(x => x.Id);

        modelBuilder.Entity<Lesson>()
            .Property(x => x.Title)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<Lesson>()
            .Property(x => x.Slug)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<Lesson>()
            .Property(x => x.LessonType)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<Lesson>()
            .Property(x => x.DifficultyLevel)
            .HasMaxLength(30)
            .IsRequired();

        modelBuilder.Entity<Lesson>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<Lesson>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<Lesson>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<Lesson>()
            .HasIndex(x => x.Slug)
            .IsUnique();

        modelBuilder.Entity<Lesson>()
            .HasOne<Course>()
            .WithMany()
            .HasForeignKey(x => x.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Lesson>()
            .HasOne<CourseModule>()
            .WithMany()
            .HasForeignKey(x => x.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Lesson>()
            .HasOne<MediaAsset>()
            .WithMany()
            .HasForeignKey(x => x.CoverMediaId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Lesson>()
            .HasOne<MediaAsset>()
            .WithMany()
            .HasForeignKey(x => x.VideoMediaId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Vocabulary>().HasKey(x => x.Id);

        modelBuilder.Entity<Vocabulary>()
            .Property(x => x.Code)
            .HasMaxLength(50);

        modelBuilder.Entity<Vocabulary>()
            .Property(x => x.TermVi)
            .HasMaxLength(150)
            .IsRequired();

        modelBuilder.Entity<Vocabulary>()
            .Property(x => x.NormalizedTerm)
            .HasMaxLength(150)
            .IsRequired();

        modelBuilder.Entity<Vocabulary>()
            .Property(x => x.DifficultyLevel)
            .HasMaxLength(30)
            .IsRequired();

        modelBuilder.Entity<Vocabulary>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<Vocabulary>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<Vocabulary>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<Vocabulary>()
            .HasOne<VocabularyCategory>()
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Vocabulary>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<VocabularyMedia>().HasKey(x => x.Id);

        modelBuilder.Entity<VocabularyMedia>()
            .Property(x => x.UsageType)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<VocabularyMedia>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<VocabularyMedia>()
            .HasIndex(x => new { x.VocabularyId, x.MediaId })
            .IsUnique();

        modelBuilder.Entity<VocabularyMedia>()
            .HasOne<Vocabulary>()
            .WithMany()
            .HasForeignKey(x => x.VocabularyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VocabularyMedia>()
            .HasOne<MediaAsset>()
            .WithMany()
            .HasForeignKey(x => x.MediaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LessonVocabulary>().HasKey(x => x.Id);

        modelBuilder.Entity<LessonVocabulary>()
            .Property(x => x.ExpectedAccuracy)
            .HasPrecision(5, 2)
            .IsRequired();

        modelBuilder.Entity<LessonVocabulary>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<LessonVocabulary>()
            .HasIndex(x => new { x.LessonId, x.VocabularyId })
            .IsUnique();

        modelBuilder.Entity<LessonVocabulary>()
            .HasOne<Lesson>()
            .WithMany()
            .HasForeignKey(x => x.LessonId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LessonVocabulary>()
            .HasOne<Vocabulary>()
            .WithMany()
            .HasForeignKey(x => x.VocabularyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Enrollment>().HasKey(x => x.Id);

        modelBuilder.Entity<Enrollment>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<Enrollment>()
            .Property(x => x.ProgressPercent)
            .HasPrecision(5, 2)
            .IsRequired();

        modelBuilder.Entity<Enrollment>()
            .Property(x => x.EnrolledAt)
            .IsRequired();

        modelBuilder.Entity<Enrollment>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<Enrollment>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<Enrollment>()
            .HasIndex(x => new { x.UserId, x.CourseId })
            .IsUnique();

        modelBuilder.Entity<Enrollment>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Enrollment>()
            .HasOne<Course>()
            .WithMany()
            .HasForeignKey(x => x.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Enrollment>()
            .HasOne<CourseModule>()
            .WithMany()
            .HasForeignKey(x => x.CurrentModuleId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Enrollment>()
            .HasOne<Lesson>()
            .WithMany()
            .HasForeignKey(x => x.CurrentLessonId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<UserLessonProgress>().HasKey(x => x.Id);

        modelBuilder.Entity<UserLessonProgress>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<UserLessonProgress>()
            .Property(x => x.BestAccuracy)
            .HasPrecision(5, 2)
            .IsRequired();

        modelBuilder.Entity<UserLessonProgress>()
            .Property(x => x.BestScore)
            .HasPrecision(6, 2)
            .IsRequired();

        modelBuilder.Entity<UserLessonProgress>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<UserLessonProgress>()
            .HasIndex(x => new { x.UserId, x.LessonId })
            .IsUnique();

        modelBuilder.Entity<UserLessonProgress>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserLessonProgress>()
            .HasOne<Lesson>()
            .WithMany()
            .HasForeignKey(x => x.LessonId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LessonAttempt>().HasKey(x => x.Id);

        modelBuilder.Entity<LessonAttempt>()
            .Property(x => x.Accuracy)
            .HasPrecision(5, 2)
            .IsRequired();

        modelBuilder.Entity<LessonAttempt>()
            .Property(x => x.CompletionSource)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<LessonAttempt>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<LessonAttempt>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LessonAttempt>()
            .HasOne<Lesson>()
            .WithMany()
            .HasForeignKey(x => x.LessonId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserVocabularyProgress>().HasKey(x => x.Id);

        modelBuilder.Entity<UserVocabularyProgress>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<UserVocabularyProgress>()
            .Property(x => x.MasteryLevel)
            .HasPrecision(5, 2)
            .IsRequired();

        modelBuilder.Entity<UserVocabularyProgress>()
            .Property(x => x.BestConfidence)
            .HasPrecision(5, 2)
            .IsRequired();

        modelBuilder.Entity<UserVocabularyProgress>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<UserVocabularyProgress>()
            .HasIndex(x => new { x.UserId, x.VocabularyId })
            .IsUnique();

        modelBuilder.Entity<UserVocabularyProgress>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserVocabularyProgress>()
            .HasOne<Vocabulary>()
            .WithMany()
            .HasForeignKey(x => x.VocabularyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TranslationSession>().HasKey(x => x.Id);

        modelBuilder.Entity<TranslationSession>()
            .Property(x => x.InputMode)
            .HasMaxLength(30)
            .IsRequired();

        modelBuilder.Entity<TranslationSession>()
            .Property(x => x.OutputMode)
            .HasMaxLength(30)
            .IsRequired();

        modelBuilder.Entity<TranslationSession>()
            .Property(x => x.SignVariantUsed)
            .HasMaxLength(50);

        modelBuilder.Entity<TranslationSession>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<TranslationSession>()
            .Property(x => x.AverageConfidence)
            .HasPrecision(5, 2)
            .IsRequired();

        modelBuilder.Entity<TranslationSession>()
            .Property(x => x.StartedAt)
            .IsRequired();

        modelBuilder.Entity<TranslationSession>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<TranslationSession>()
            .HasOne<MediaAsset>()
            .WithMany()
            .HasForeignKey(x => x.FinalAudioMediaId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<TranslationSegment>().HasKey(x => x.Id);

        modelBuilder.Entity<TranslationSegment>()
            .Property(x => x.RecognizedText)
            .HasMaxLength(255)
            .IsRequired();

        modelBuilder.Entity<TranslationSegment>()
            .Property(x => x.NormalizedText)
            .HasMaxLength(255);

        modelBuilder.Entity<TranslationSegment>()
            .Property(x => x.Confidence)
            .HasPrecision(5, 2)
            .IsRequired();

        modelBuilder.Entity<TranslationSegment>()
            .Property(x => x.RawPredictionJson)
            .HasColumnType("jsonb");

        modelBuilder.Entity<TranslationSegment>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<TranslationSegment>()
            .HasIndex(x => new { x.SessionId, x.SegmentOrder })
            .IsUnique();

        modelBuilder.Entity<TranslationSegment>()
            .HasOne<TranslationSession>()
            .WithMany()
            .HasForeignKey(x => x.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TranslationSegment>()
            .HasOne<Vocabulary>()
            .WithMany()
            .HasForeignKey(x => x.MatchedVocabularyId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<TranslationSegment>()
            .HasOne<MediaAsset>()
            .WithMany()
            .HasForeignKey(x => x.AudioMediaId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<PracticeSession>().HasKey(x => x.Id);

        modelBuilder.Entity<PracticeSession>()
            .Property(x => x.Mode)
            .HasMaxLength(30)
            .IsRequired();

        modelBuilder.Entity<PracticeSession>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<PracticeSession>()
            .Property(x => x.Accuracy)
            .HasPrecision(5, 2)
            .IsRequired();

        modelBuilder.Entity<PracticeSession>()
            .Property(x => x.StartedAt)
            .IsRequired();

        modelBuilder.Entity<PracticeSession>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PracticeSession>()
            .HasOne<Course>()
            .WithMany()
            .HasForeignKey(x => x.CourseId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<PracticeSession>()
            .HasOne<Lesson>()
            .WithMany()
            .HasForeignKey(x => x.LessonId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<PracticeSession>()
            .HasOne<Vocabulary>()
            .WithMany()
            .HasForeignKey(x => x.VocabularyId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<PracticeAttempt>().HasKey(x => x.Id);

        modelBuilder.Entity<PracticeAttempt>()
            .Property(x => x.ExpectedText)
            .HasMaxLength(255);

        modelBuilder.Entity<PracticeAttempt>()
            .Property(x => x.RecognizedText)
            .HasMaxLength(255);

        modelBuilder.Entity<PracticeAttempt>()
            .Property(x => x.Confidence)
            .HasPrecision(5, 2)
            .IsRequired();

        modelBuilder.Entity<PracticeAttempt>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<PracticeAttempt>()
            .HasIndex(x => new { x.PracticeSessionId, x.SortOrder })
            .IsUnique();

        modelBuilder.Entity<PracticeAttempt>()
            .HasOne<PracticeSession>()
            .WithMany()
            .HasForeignKey(x => x.PracticeSessionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PracticeAttempt>()
            .HasOne<Vocabulary>()
            .WithMany()
            .HasForeignKey(x => x.ExpectedVocabularyId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PracticeAttempt>()
            .HasOne<Vocabulary>()
            .WithMany()
            .HasForeignKey(x => x.RecognizedVocabularyId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<SubscriptionPlan>().HasKey(x => x.Id);

        modelBuilder.Entity<SubscriptionPlan>()
            .Property(x => x.Code)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<SubscriptionPlan>()
            .Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<SubscriptionPlan>()
            .Property(x => x.BillingCycle)
            .HasMaxLength(20)
            .IsRequired();

        modelBuilder.Entity<SubscriptionPlan>()
            .Property(x => x.CourseAccessScope)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<SubscriptionPlan>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<SubscriptionPlan>()
            .HasIndex(x => x.Code)
            .IsUnique();

        modelBuilder.Entity<UserSubscription>().HasKey(x => x.Id);

        modelBuilder.Entity<UserSubscription>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<UserSubscription>()
            .Property(x => x.Source)
            .HasMaxLength(50);

        modelBuilder.Entity<UserSubscription>()
            .Property(x => x.StartAt)
            .IsRequired();

        modelBuilder.Entity<UserSubscription>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<UserSubscription>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserSubscription>()
            .HasOne<SubscriptionPlan>()
            .WithMany()
            .HasForeignKey(x => x.PlanId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PaymentTransaction>().HasKey(x => x.Id);

        modelBuilder.Entity<PaymentTransaction>()
            .Property(x => x.Currency)
            .HasMaxLength(10)
            .IsRequired();

        modelBuilder.Entity<PaymentTransaction>()
            .Property(x => x.PaymentMethod)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<PaymentTransaction>()
            .Property(x => x.PaymentProvider)
            .HasMaxLength(50);

        modelBuilder.Entity<PaymentTransaction>()
            .Property(x => x.ProviderTransactionRef)
            .HasMaxLength(255);

        modelBuilder.Entity<PaymentTransaction>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<PaymentTransaction>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<PaymentTransaction>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PaymentTransaction>()
            .HasOne<UserSubscription>()
            .WithMany()
            .HasForeignKey(x => x.UserSubscriptionId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Notification>().HasKey(x => x.Id);

        modelBuilder.Entity<Notification>()
            .Property(x => x.Title)
            .HasMaxLength(200)
            .IsRequired();

        modelBuilder.Entity<Notification>()
            .Property(x => x.Type)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<Notification>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<Notification>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FeedbackCategory>().HasKey(x => x.Id);

        modelBuilder.Entity<FeedbackCategory>()
            .Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<FeedbackCategory>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<FeedbackCategory>()
            .HasIndex(x => x.Name)
            .IsUnique();

        modelBuilder.Entity<Feedback>().HasKey(x => x.Id);

        modelBuilder.Entity<Feedback>()
            .Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<Feedback>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<Feedback>()
            .Property(x => x.UpdatedAt)
            .IsRequired();

        modelBuilder.Entity<Feedback>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Feedback>()
            .HasOne<FeedbackCategory>()
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Feedback>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.RespondedBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Badge>().HasKey(x => x.Id);

        modelBuilder.Entity<Badge>()
            .Property(x => x.Code)
            .HasMaxLength(50)
            .IsRequired();

        modelBuilder.Entity<Badge>()
            .Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<Badge>()
            .Property(x => x.BadgeType)
            .HasConversion<string>()
            .IsRequired();

        modelBuilder.Entity<Badge>()
            .Property(x => x.CriteriaJson)
            .HasColumnType("jsonb");

        modelBuilder.Entity<Badge>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<Badge>()
            .HasIndex(x => x.Code)
            .IsUnique();

        modelBuilder.Entity<Badge>()
            .HasOne<MediaAsset>()
            .WithMany()
            .HasForeignKey(x => x.IconMediaId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<UserBadge>().HasKey(x => x.Id);

        modelBuilder.Entity<UserBadge>()
            .Property(x => x.AwardedAt)
            .IsRequired();

        modelBuilder.Entity<UserBadge>()
            .HasIndex(x => new { x.UserId, x.BadgeId })
            .IsUnique();

        modelBuilder.Entity<UserBadge>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserBadge>()
            .HasOne<Badge>()
            .WithMany()
            .HasForeignKey(x => x.BadgeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserActivityLog>().HasKey(x => x.Id);

        modelBuilder.Entity<UserActivityLog>()
            .Property(x => x.ActionType)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<UserActivityLog>()
            .Property(x => x.EntityType)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<UserActivityLog>()
            .Property(x => x.MetadataJson)
            .HasColumnType("jsonb");

        modelBuilder.Entity<UserActivityLog>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<UserActivityLog>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AdminActionLog>().HasKey(x => x.Id);

        modelBuilder.Entity<AdminActionLog>()
            .Property(x => x.ActionType)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<AdminActionLog>()
            .Property(x => x.EntityType)
            .HasMaxLength(100)
            .IsRequired();

        modelBuilder.Entity<AdminActionLog>()
            .Property(x => x.CreatedAt)
            .IsRequired();

        modelBuilder.Entity<AdminActionLog>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.AdminUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
