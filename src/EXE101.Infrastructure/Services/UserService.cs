using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Emails;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.Users;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Cryptography;

namespace EXE101.Infrastructure.Services;

public sealed class UserService(
    IUserRepository userRepository,
    IJwtTokenService jwtTokenService,
    AppDbContext dbContext,
    IEmailSender emailSender,
    IMemoryCache memoryCache) : IUserService
{
    private const string AccountDeletionOtpCachePrefix = "account-deletion-otp:";
    private const string PasswordResetOtpCachePrefix = "password-reset-otp:";
    private const int AccountDeletionOtpMinutes = 15;
    private const int PasswordResetOtpMinutes = 15;
    private const int MaxAccountDeletionOtpAttempts = 5;
    private const int MaxPasswordResetOtpAttempts = 5;

    private readonly IUserRepository _userRepository = userRepository;
    private readonly IJwtTokenService _jwtTokenService = jwtTokenService;
    private readonly AppDbContext _dbContext = dbContext;
    private readonly IEmailSender _emailSender = emailSender;
    private readonly IMemoryCache _memoryCache = memoryCache;

    public async Task<PagedResult<UserResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);

        var total = await _userRepository.CountAsync(cancellationToken);
        var entities = await _userRepository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<UserResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<UserResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _userRepository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureRoleExistsAsync(request.RoleId, cancellationToken);

        var email = NormalizeEmail(request.Email);
        var exists = await _userRepository.ExistsByEmailAsync(email, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Email already exists.");
        }

        var now = DateTime.UtcNow;
        var entity = new User
        {
            RoleId = request.RoleId,
            Email = email,
            PasswordHash = string.IsNullOrWhiteSpace(request.Password) ? null : BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            AvatarMediaId = request.AvatarMediaId,
            Status = request.Status,
            CreatedAt = now,
            UpdatedAt = now
        };

        var created = await _userRepository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<UserResponse?> UpdateAsync(long id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await EnsureRoleExistsAsync(request.RoleId, cancellationToken);

        var email = NormalizeEmail(request.Email);
        var exists = await _userRepository.ExistsByEmailAsync(email, excludeId: id, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("Email already exists.");
        }

        entity.RoleId = request.RoleId;
        entity.Email = email;
        entity.FullName = request.FullName.Trim();
        entity.AvatarMediaId = request.AvatarMediaId;
        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _userRepository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public async Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
    {
        return await _userRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<UserResponse?> ChangeStatusAsync(long id, ChangeStatusRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _userRepository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public async Task<UserResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new InvalidOperationException("Password is required.");
        }

        var defaultRoleId = await _dbContext.Roles.AsNoTracking()
            .Where(x => x.Code == "user")
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (defaultRoleId <= 0)
        {
            throw new InvalidOperationException("Default role 'user' does not exist.");
        }

        return await CreateAsync(new CreateUserRequest
        {
            RoleId = defaultRoleId,
            Email = request.Email,
            Password = request.Password,
            FullName = request.FullName,
            Status = UserStatus.Active
        }, cancellationToken);
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken)
            ?? throw new InvalidOperationException("Invalid email or password.");

        if (string.IsNullOrWhiteSpace(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        if (user.Status != UserStatus.Active)
        {
            throw new InvalidOperationException("User is not active.");
        }

        var roleCode = await _dbContext.Roles.AsNoTracking()
            .Where(x => x.Id == user.RoleId)
            .Select(x => x.Code)
            .FirstOrDefaultAsync(cancellationToken) ?? string.Empty;

        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        var jwt = _jwtTokenService.GenerateToken(user.Id, user.Email, user.FullName, roleCode);

        return new LoginResponse
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            RoleCode = roleCode,
            SessionToken = jwt.AccessToken,
            AccessToken = jwt.AccessToken,
            TokenType = "Bearer",
            ExpiresAtUtc = jwt.ExpiresAtUtc
        };
    }

    public async Task<UserResponse?> ChangePasswordAsync(long userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            throw new InvalidOperationException("New password is required.");
        }

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new InvalidOperationException("Current password is invalid.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        var updated = await _userRepository.UpdateAsync(user, cancellationToken);
        return Map(updated);
    }

    public async Task<UserResponse?> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return null;
        }

        user.EmailVerifiedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        var updated = await _userRepository.UpdateAsync(user, cancellationToken);
        return Map(updated);
    }

    public async Task<UserResponse?> UpdateAvatarAsync(long userId, UpdateAvatarRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return null;
        }

        user.AvatarMediaId = request.AvatarMediaId;
        user.UpdatedAt = DateTime.UtcNow;

        var updated = await _userRepository.UpdateAsync(user, cancellationToken);
        return Map(updated);
    }

    private async Task EnsureRoleExistsAsync(long roleId, CancellationToken cancellationToken)
    {
        if (roleId <= 0)
        {
            throw new InvalidOperationException("RoleId must be greater than zero.");
        }

        var exists = await _dbContext.Roles.AsNoTracking().AnyAsync(x => x.Id == roleId, cancellationToken);
        if (!exists)
        {
            throw new InvalidOperationException("Role does not exist.");
        }
    }

    private static string NormalizeEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new InvalidOperationException("Email is required.");
        }

        return email.Trim().ToLowerInvariant();
    }

    private static UserResponse Map(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            RoleId = user.RoleId,
            Email = user.Email,
            FullName = user.FullName,
            AvatarMediaId = user.AvatarMediaId,
            Status = user.Status,
            EmailVerifiedAt = user.EmailVerifiedAt,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<LoginResponse> GoogleLoginAsync(GoogleLoginRequest request, CancellationToken cancellationToken = default)
    {
        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Invalid Google token.", ex);
        }

        var email = NormalizeEmail(payload.Email);
        var googleUserId = payload.Subject;
        var name = request.FullName ?? payload.Name ?? "Google User";

        var authAccount = await _dbContext.AuthAccounts
            .FirstOrDefaultAsync(x => x.Provider == AuthProvider.Google && x.ProviderUserId == googleUserId, cancellationToken);

        User? user = null;
        if (authAccount != null)
        {
            user = await _userRepository.GetByIdAsync(authAccount.UserId, cancellationToken);
        }

        if (user == null)
        {
            user = await _userRepository.GetByEmailAsync(email, cancellationToken);

            if (user == null)
            {
                var defaultRoleId = await _dbContext.Roles.AsNoTracking()
                    .Where(x => x.Code == "user")
                    .Select(x => x.Id)
                    .FirstOrDefaultAsync(cancellationToken);

                if (defaultRoleId <= 0)
                {
                    throw new InvalidOperationException("Default role 'user' does not exist.");
                }

                var now = DateTime.UtcNow;
                user = new User
                {
                    RoleId = defaultRoleId,
                    Email = email,
                    PasswordHash = null,
                    FullName = name.Trim(),
                    Status = UserStatus.Active,
                    EmailVerifiedAt = now,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                user = await _userRepository.AddAsync(user, cancellationToken);
            }

            var newAuthAccount = new AuthAccount
            {
                UserId = user.Id,
                Provider = AuthProvider.Google,
                ProviderUserId = googleUserId,
                ProviderEmail = email,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.AuthAccounts.Add(newAuthAccount);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        if (user.Status != UserStatus.Active)
        {
            throw new InvalidOperationException("User is not active.");
        }

        var roleCode = await _dbContext.Roles.AsNoTracking()
            .Where(x => x.Id == user.RoleId)
            .Select(x => x.Code)
            .FirstOrDefaultAsync(cancellationToken) ?? string.Empty;

        user.LastLoginAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        var jwt = _jwtTokenService.GenerateToken(user.Id, user.Email, user.FullName, roleCode);

        return new LoginResponse
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            RoleCode = roleCode,
            SessionToken = jwt.AccessToken,
            AccessToken = jwt.AccessToken,
            TokenType = "Bearer",
            ExpiresAtUtc = jwt.ExpiresAtUtc
        };
    }

    public async Task RequestAccountDeletionOtpAsync(RequestAccountDeletionOtpRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user is null || user.Status != UserStatus.Active)
        {
            return;
        }

        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var expiresAtUtc = DateTimeOffset.UtcNow.AddMinutes(AccountDeletionOtpMinutes);
        var challenge = new AccountDeletionOtpChallenge(email, BCrypt.Net.BCrypt.HashPassword(code), expiresAtUtc, 0);

        var emailContent = EmailTemplates.VerificationCode(
            user.FullName,
            "Mã xác nhận xóa tài khoản",
            "Bạn vừa yêu cầu xóa tài khoản Sign Language Eleven. Nhập mã dưới đây để xác nhận thao tác này.",
            code,
            AccountDeletionOtpMinutes,
            "Nếu bạn không yêu cầu xóa tài khoản, vui lòng bỏ qua email này và giữ an toàn thông tin đăng nhập.");

        await _emailSender.SendAsync(email, emailContent.Subject, emailContent.TextBody, emailContent.HtmlBody, cancellationToken);

        _memoryCache.Set(GetAccountDeletionOtpCacheKey(email), challenge, new MemoryCacheEntryOptions
        {
            AbsoluteExpiration = expiresAtUtc
        });
    }

    public async Task<bool> ConfirmAccountDeletionAsync(ConfirmAccountDeletionRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var code = request.Code.Trim();

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new InvalidOperationException("Confirmation code is required.");
        }

        var cacheKey = GetAccountDeletionOtpCacheKey(email);
        if (!_memoryCache.TryGetValue<AccountDeletionOtpChallenge>(cacheKey, out var challenge) || challenge is null)
        {
            throw new InvalidOperationException("Confirmation code is invalid or expired.");
        }

        if (!BCrypt.Net.BCrypt.Verify(code, challenge.CodeHash))
        {
            var failedAttempts = challenge.FailedAttempts + 1;
            if (failedAttempts >= MaxAccountDeletionOtpAttempts)
            {
                _memoryCache.Remove(cacheKey);
            }
            else
            {
                _memoryCache.Set(cacheKey, challenge with { FailedAttempts = failedAttempts }, new MemoryCacheEntryOptions
                {
                    AbsoluteExpiration = challenge.ExpiresAtUtc
                });
            }

            throw new InvalidOperationException("Confirmation code is invalid or expired.");
        }

        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user is null)
        {
            _memoryCache.Remove(cacheKey);
            return false;
        }

        var deleted = await DeleteAsync(user.Id, cancellationToken);
        if (deleted)
        {
            _memoryCache.Remove(cacheKey);
        }

        return deleted;
    }

    public async Task RequestPasswordResetOtpAsync(RequestPasswordResetOtpRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user is null || user.Status != UserStatus.Active)
        {
            return;
        }

        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var expiresAtUtc = DateTimeOffset.UtcNow.AddMinutes(PasswordResetOtpMinutes);
        var challenge = new PasswordResetOtpChallenge(email, BCrypt.Net.BCrypt.HashPassword(code), expiresAtUtc, 0);

        var emailContent = EmailTemplates.VerificationCode(
            user.FullName,
            "Mã đặt lại mật khẩu",
            "Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Sign Language Eleven. Nhập mã dưới đây để tạo mật khẩu mới.",
            code,
            PasswordResetOtpMinutes,
            "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.");

        await _emailSender.SendAsync(email, emailContent.Subject, emailContent.TextBody, emailContent.HtmlBody, cancellationToken);

        _memoryCache.Set(GetPasswordResetOtpCacheKey(email), challenge, new MemoryCacheEntryOptions
        {
            AbsoluteExpiration = expiresAtUtc
        });
    }

    public async Task<bool> ConfirmPasswordResetAsync(ConfirmPasswordResetRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var code = request.Code.Trim();

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new InvalidOperationException("Confirmation code is required.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            throw new InvalidOperationException("New password is required.");
        }

        var cacheKey = GetPasswordResetOtpCacheKey(email);
        if (!_memoryCache.TryGetValue<PasswordResetOtpChallenge>(cacheKey, out var challenge) || challenge is null)
        {
            throw new InvalidOperationException("Confirmation code is invalid or expired.");
        }

        if (!BCrypt.Net.BCrypt.Verify(code, challenge.CodeHash))
        {
            var failedAttempts = challenge.FailedAttempts + 1;
            if (failedAttempts >= MaxPasswordResetOtpAttempts)
            {
                _memoryCache.Remove(cacheKey);
            }
            else
            {
                _memoryCache.Set(cacheKey, challenge with { FailedAttempts = failedAttempts }, new MemoryCacheEntryOptions
                {
                    AbsoluteExpiration = challenge.ExpiresAtUtc
                });
            }

            throw new InvalidOperationException("Confirmation code is invalid or expired.");
        }

        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user is null)
        {
            _memoryCache.Remove(cacheKey);
            return false;
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);
        _memoryCache.Remove(cacheKey);

        return true;
    }

    private static string GetAccountDeletionOtpCacheKey(string email)
        => $"{AccountDeletionOtpCachePrefix}{email}";

    private static string GetPasswordResetOtpCacheKey(string email)
        => $"{PasswordResetOtpCachePrefix}{email}";

    private sealed record AccountDeletionOtpChallenge(
        string Email,
        string CodeHash,
        DateTimeOffset ExpiresAtUtc,
        int FailedAttempts);

    private sealed record PasswordResetOtpChallenge(
        string Email,
        string CodeHash,
        DateTimeOffset ExpiresAtUtc,
        int FailedAttempts);
}
