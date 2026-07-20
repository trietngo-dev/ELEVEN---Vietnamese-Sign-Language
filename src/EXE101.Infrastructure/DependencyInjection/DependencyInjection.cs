using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Infrastructure.Persistence;
using EXE101.Infrastructure.Repositories;
using EXE101.Infrastructure.Security;
using EXE101.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EXE101.Infrastructure.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString)
                   .UseSnakeCaseNamingConvention());

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<SupabaseStorageOptions>(configuration.GetSection(SupabaseStorageOptions.SectionName));
        services.Configure<SmtpEmailOptions>(configuration.GetSection(SmtpEmailOptions.SectionName));

        services.AddMemoryCache();

        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IAuthAccountRepository, AuthAccountRepository>();
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        services.AddScoped<IUserSettingRepository, UserSettingRepository>();
        services.AddScoped<IMediaAssetRepository, MediaAssetRepository>();
        services.AddScoped<ICourseCategoryRepository, CourseCategoryRepository>();
        services.AddScoped<IVocabularyCategoryRepository, VocabularyCategoryRepository>();
        services.AddScoped<ICourseRepository, CourseRepository>();
        services.AddScoped<ICourseModuleRepository, CourseModuleRepository>();
        services.AddScoped<ILessonRepository, LessonRepository>();
        services.AddScoped<IVocabularyRepository, VocabularyRepository>();
        services.AddScoped<IVocabularyMediaRepository, VocabularyMediaRepository>();
        services.AddScoped<ILessonVocabularyRepository, LessonVocabularyRepository>();
        services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
        services.AddScoped<IUserLessonProgressRepository, UserLessonProgressRepository>();
        services.AddScoped<ILessonAttemptRepository, LessonAttemptRepository>();
        services.AddScoped<IUserVocabularyProgressRepository, UserVocabularyProgressRepository>();
        services.AddScoped<ITranslationSessionRepository, TranslationSessionRepository>();
        services.AddScoped<ITranslationSegmentRepository, TranslationSegmentRepository>();
        services.AddScoped<IPracticeSessionRepository, PracticeSessionRepository>();
        services.AddScoped<IPracticeAttemptRepository, PracticeAttemptRepository>();
        services.AddScoped<ISubscriptionPlanRepository, SubscriptionPlanRepository>();
        services.AddScoped<IUserSubscriptionRepository, UserSubscriptionRepository>();
        services.AddScoped<IPaymentTransactionRepository, PaymentTransactionRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IFeedbackCategoryRepository, FeedbackCategoryRepository>();
        services.AddScoped<IFeedbackRepository, FeedbackRepository>();
        services.AddScoped<IBadgeRepository, BadgeRepository>();
        services.AddScoped<IUserBadgeRepository, UserBadgeRepository>();
        services.AddScoped<IUserActivityLogRepository, UserActivityLogRepository>();
        services.AddScoped<IAdminActionLogRepository, AdminActionLogRepository>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthAccountService, AuthAccountService>();
        services.AddScoped<IUserProfileService, UserProfileService>();
        services.AddScoped<IUserSettingService, UserSettingService>();
        services.AddScoped<IMediaAssetService, MediaAssetService>();
        services.AddScoped<ICourseCategoryService, CourseCategoryService>();
        services.AddScoped<IVocabularyCategoryService, VocabularyCategoryService>();
        services.AddScoped<ICourseService, CourseService>();
        services.AddScoped<ICourseModuleService, CourseModuleService>();
        services.AddScoped<ILessonService, LessonService>();
        services.AddScoped<IVocabularyService, VocabularyService>();
        services.AddScoped<IVocabularyMediaService, VocabularyMediaService>();
        services.AddScoped<ILessonVocabularyService, LessonVocabularyService>();
        services.AddScoped<IEnrollmentService, EnrollmentService>();
        services.AddScoped<IUserLessonProgressService, UserLessonProgressService>();
        services.AddScoped<ILessonAttemptService, LessonAttemptService>();
        services.AddScoped<IUserVocabularyProgressService, UserVocabularyProgressService>();
        services.AddScoped<ITranslationSessionService, TranslationSessionService>();
        services.AddScoped<ITranslationSegmentService, TranslationSegmentService>();
        services.AddScoped<IPracticeSessionService, PracticeSessionService>();
        services.AddScoped<IPracticeAttemptService, PracticeAttemptService>();
        services.AddScoped<ISubscriptionPlanService, SubscriptionPlanService>();
        services.AddScoped<IUserSubscriptionService, UserSubscriptionService>();
        services.AddScoped<IPaymentTransactionService, PaymentTransactionService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IFeedbackCategoryService, FeedbackCategoryService>();
        services.AddScoped<IFeedbackService, FeedbackService>();
        services.AddScoped<IBadgeService, BadgeService>();
        services.AddScoped<IUserBadgeService, UserBadgeService>();
        services.AddScoped<IUserActivityLogService, UserActivityLogService>();
        services.AddScoped<IAdminActionLogService, AdminActionLogService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddHttpClient<IEmailSender, SmtpEmailSender>();
        services.AddSingleton<IGesturePredictionService, GesturePredictionService>();
        services.AddSingleton<IFeatureExtractionService, GestureFeatureExtractionService>();
        services.AddSingleton<IFrameBufferService, GestureFrameBufferService>();
        services.AddHttpClient<IGeminiTranslationService, GeminiTranslationService>();
        services.AddHttpClient<IPayOsService, PayOsService>();

        return services;
    }
}
