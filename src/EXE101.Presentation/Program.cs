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

    if (!dbContext.SubscriptionPlans.Any(x => x.Code == "pro"))
    {
        dbContext.SubscriptionPlans.Add(new SubscriptionPlan
        {
            Code = "pro",
            Name = "Gói Pro (Tháng)",
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

    if (!dbContext.SubscriptionPlans.Any(x => x.Code == "premium"))
    {
        dbContext.SubscriptionPlans.Add(new SubscriptionPlan
        {
            Code = "premium",
            Name = "Gói Premium (Năm)",
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
