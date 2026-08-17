using EXE101.Application.DependencyInjection;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.DependencyInjection;
using EXE101.Infrastructure.Persistence;
using EXE101.Infrastructure.Security;
using EXE101.Presentation.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Jwt configuration section is missing.");

if (string.IsNullOrWhiteSpace(jwtOptions.SecretKey) || jwtOptions.SecretKey.Length < 32)
{
    throw new InvalidOperationException("Jwt:SecretKey must be configured and have at least 32 characters.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = jwtOptions.Issuer,
        ValidAudience = jwtOptions.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("admin"));
    options.AddPolicy("AdminOrModerator", policy => policy.RequireRole("admin", "moderator"));
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EXE101 Roles + Users API",
        Version = "v1",
        Description = "CRUD API for roles/users and user auth operations"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT Bearer token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin();
    });
});

var app = builder.Build();

// Apply pending migrations automatically. First run creates database/schema; later runs keep existing data.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();

    var now = DateTime.UtcNow;

    if (!dbContext.Roles.Any(x => x.Code == "admin"))
    {
        dbContext.Roles.Add(new Role
        {
            Code = "admin",
            Name = "Administrator",
            Description = "System administrator",
            CreatedAt = now
        });
    }

    if (!dbContext.Roles.Any(x => x.Code == "user"))
    {
        dbContext.Roles.Add(new Role
        {
            Code = "user",
            Name = "User",
            Description = "Default user role",
            CreatedAt = now
        });
    }

    if (!dbContext.Roles.Any(x => x.Code == "moderator"))
    {
        dbContext.Roles.Add(new Role
        {
            Code = "moderator",
            Name = "Moderator",
            Description = "Moderator role",
            CreatedAt = now
        });
    }

    dbContext.SaveChanges();

    var adminRoleId = dbContext.Roles.Where(x => x.Code == "admin").Select(x => x.Id).First();
    if (!dbContext.Users.Any(x => x.Email == "admin@exe101.local"))
    {
        dbContext.Users.Add(new User
        {
            RoleId = adminRoleId,
            Email = "admin@exe101.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FullName = "EXE101 Admin",
            Status = UserStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        });

        dbContext.SaveChanges();
    }

    // Clean up duplicate lowercase plans if uppercase ones exist
    var lowercasePro = dbContext.SubscriptionPlans.FirstOrDefault(x => x.Code == "pro");
    var uppercasePro = dbContext.SubscriptionPlans.FirstOrDefault(x => x.Code == "PRO");
    if (lowercasePro != null)
    {
        if (uppercasePro == null)
        {
            lowercasePro.Code = "PRO";
            dbContext.SaveChanges();
            uppercasePro = lowercasePro;
        }
        else
        {
            var subs = dbContext.UserSubscriptions.Where(s => s.PlanId == lowercasePro.Id).ToList();
            foreach (var sub in subs)
            {
                sub.PlanId = uppercasePro.Id;
            }
            dbContext.SubscriptionPlans.Remove(lowercasePro);
            dbContext.SaveChanges();
        }
    }

    var lowercasePremium = dbContext.SubscriptionPlans.FirstOrDefault(x => x.Code == "premium");
    var uppercasePremium = dbContext.SubscriptionPlans.FirstOrDefault(x => x.Code == "PREMIUM");
    if (lowercasePremium != null)
    {
        if (uppercasePremium == null)
        {
            lowercasePremium.Code = "PREMIUM";
            dbContext.SaveChanges();
            uppercasePremium = lowercasePremium;
        }
        else
        {
            var subs = dbContext.UserSubscriptions.Where(s => s.PlanId == lowercasePremium.Id).ToList();
            foreach (var sub in subs)
            {
                sub.PlanId = uppercasePremium.Id;
            }
            dbContext.SubscriptionPlans.Remove(lowercasePremium);
            dbContext.SaveChanges();
        }
    }

    if (!dbContext.SubscriptionPlans.Any(x => x.Code.ToUpper() == "PRO"))
    {
        dbContext.SubscriptionPlans.Add(new SubscriptionPlan
        {
            Code = "PRO",
            Name = "Gói Chuyên nghiệp (Tháng)",
            BillingCycle = "monthly",
            PriceVnd = 30000,
            DailyTranslationLimit = 99999,
            AiPracticeLimit = 99999,
            CourseAccessScope = "All",
            CanSaveHistory = true,
            CertificateEnabled = false,
            PrioritySupport = true,
            IsActive = true,
            DisplayOrder = 1,
            CreatedAt = now
        });
    }

    if (!dbContext.SubscriptionPlans.Any(x => x.Code.ToUpper() == "PREMIUM"))
    {
        dbContext.SubscriptionPlans.Add(new SubscriptionPlan
        {
            Code = "PREMIUM",
            Name = "Gói Cao cấp (Năm)",
            BillingCycle = "yearly",
            PriceVnd = 50000,
            DailyTranslationLimit = 99999,
            AiPracticeLimit = 99999,
            CourseAccessScope = "All",
            CanSaveHistory = true,
            CertificateEnabled = true,
            PrioritySupport = true,
            IsActive = true,
            DisplayOrder = 2,
            CreatedAt = now
        });
    }

    if (!dbContext.FeedbackCategories.Any(x => x.Name == "Course"))
    {
        dbContext.FeedbackCategories.Add(new FeedbackCategory
        {
            Name = "Course",
            Description = "Course Ratings and Reviews",
            IsActive = true,
            CreatedAt = now
        });
    }

    if (!dbContext.FeedbackCategories.Any(x => x.Name == "Support"))
    {
        dbContext.FeedbackCategories.Add(new FeedbackCategory
        {
            Name = "Support",
            Description = "User Help and Support Desk Requests",
            IsActive = true,
            CreatedAt = now
        });
    }

    if (!dbContext.VocabularyCategories.Any(x => x.Slug == "general"))
    {
        dbContext.VocabularyCategories.Add(new VocabularyCategory
        {
            Name = "General",
            Slug = "general",
            Description = "General vocabulary",
            CreatedAt = now
        });
    }

    if (!dbContext.AvatarFrames.Any())
    {
        dbContext.AvatarFrames.AddRange(
            new AvatarFrame
            {
                Code = "FRAME_GREEN",
                Name = "Khung Mầm Non",
                ImageUrl = "/assets/frame_green.png",
                XpPrice = 100,
                IsActive = true,
                CreatedAt = now
            },
            new AvatarFrame
            {
                Code = "FRAME_SILVER",
                Name = "Khung Bạc Tri Thức",
                ImageUrl = "/assets/frame_silver.png",
                XpPrice = 500,
                IsActive = true,
                CreatedAt = now
            },
            new AvatarFrame
            {
                Code = "FRAME_GOLD",
                Name = "Khung Hoàng Kim",
                ImageUrl = "/assets/frame_gold.png",
                XpPrice = 2000,
                IsActive = true,
                CreatedAt = now
            }
        );
    }

    if (!dbContext.Badges.Any())
    {
        dbContext.Badges.AddRange(
            new Badge
            {
                Code = "START",
                Name = "Khởi đầu",
                Description = "Dành cho người mới bắt đầu học",
                BadgeType = BadgeType.Achievement,
                CreatedAt = now
            },
            new Badge
            {
                Code = "STREAK_7D",
                Name = "Chuyên cần",
                Description = "Cho 7 ngày đăng nhập liên tiếp",
                BadgeType = BadgeType.Streak,
                CreatedAt = now
            },
            new Badge
            {
                Code = "STREAK_3D",
                Name = "Kỷ lục 3 ngày",
                Description = "Đạt streak 3 ngày đăng nhập",
                BadgeType = BadgeType.Streak,
                CreatedAt = now
            },
            new Badge
            {
                Code = "STREAK_5D",
                Name = "Kỷ lục 5 ngày",
                Description = "Đạt streak 5 ngày đăng nhập",
                BadgeType = BadgeType.Streak,
                CreatedAt = now
            },
            new Badge
            {
                Code = "STREAK_30D",
                Name = "Kỷ lục 30 ngày",
                Description = "Đạt streak 30 ngày đăng nhập",
                BadgeType = BadgeType.Streak,
                CreatedAt = now
            },
            new Badge
            {
                Code = "STREAK_365D",
                Name = "Kỷ lục 365 ngày",
                Description = "Đạt streak 365 ngày đăng nhập",
                BadgeType = BadgeType.Streak,
                CreatedAt = now
            },
            new Badge
            {
                Code = "DETERMINED",
                Name = "Quyết tâm",
                Description = "Cho người học trên 3 khóa học",
                BadgeType = BadgeType.Milestone,
                CreatedAt = now
            },
            new Badge
            {
                Code = "COLLECTOR",
                Name = "Nhà sưu tập",
                Description = "Thu thập trên 5 huy hiệu",
                BadgeType = BadgeType.Achievement,
                CreatedAt = now
            }
        );
    }

    dbContext.SaveChanges();
}

// Swagger enabled in all environments for API testing on Render
// TODO: Restrict to Development only after deployment is stable
app.UseSwagger();
app.UseSwaggerUI();

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseGlobalExceptionHandling();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
