using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Users;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public sealed class UsersController(IUserService userService) : ControllerBase
{
    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await userService.GetPagedAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById([FromRoute] long id, CancellationToken cancellationToken = default)
    {
        if (!IsAdmin() && GetCurrentUserId() != id)
        {
            return Forbid();
        }

        var result = await userService.GetByIdAsync(id, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        return Ok(result);
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        var result = await userService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update([FromRoute] long id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        if (!IsAdmin() && GetCurrentUserId() != id)
        {
            return Forbid();
        }

        var result = await userService.UpdateAsync(id, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete([FromRoute] long id, CancellationToken cancellationToken = default)
    {
        if (!IsAdmin() && GetCurrentUserId() != id)
        {
            return Forbid();
        }

        var deleted = await userService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        return NoContent();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPatch("{id:long}/status")]
    public async Task<IActionResult> ChangeStatus([FromRoute] long id, [FromBody] ChangeStatusRequest request, CancellationToken cancellationToken = default)
    {
        var result = await userService.ChangeStatusAsync(id, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var result = await userService.RegisterAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken = default)
    {
        var result = await userService.LoginAsync(request, cancellationToken);
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request, CancellationToken cancellationToken = default)
    {
        var result = await userService.GoogleLoginAsync(request, cancellationToken);
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("account-deletion/request-otp")]
    public async Task<IActionResult> RequestAccountDeletionOtp([FromBody] RequestAccountDeletionOtpRequest request, CancellationToken cancellationToken = default)
    {
        await userService.RequestAccountDeletionOtpAsync(request, cancellationToken);
        return Ok(new AccountDeletionOtpResponse
        {
            Message = "If the email exists, a confirmation code has been sent."
        });
    }

    [AllowAnonymous]
    [HttpPost("account-deletion/confirm")]
    public async Task<IActionResult> ConfirmAccountDeletion([FromBody] ConfirmAccountDeletionRequest request, CancellationToken cancellationToken = default)
    {
        var deleted = await userService.ConfirmAccountDeletionAsync(request, cancellationToken);
        if (!deleted)
        {
            return NotFound(new { message = "User account was not found." });
        }

        return Ok(new { message = "Account deleted successfully." });
    }

    [HttpPost("{id:long}/change-password")]
    public async Task<IActionResult> ChangePassword([FromRoute] long id, [FromBody] ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (!IsAdmin() && GetCurrentUserId() != id)
        {
            return Forbid();
        }

        var result = await userService.ChangePasswordAsync(id, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request, CancellationToken cancellationToken = default)
    {
        if (!IsAdmin() && GetCurrentUserId() != request.UserId)
        {
            return Forbid();
        }

        var result = await userService.VerifyEmailAsync(request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User with id {request.UserId} was not found." });
        }

        return Ok(result);
    }

    [HttpPatch("{id:long}/avatar")]
    public async Task<IActionResult> UpdateAvatar([FromRoute] long id, [FromBody] UpdateAvatarRequest request, CancellationToken cancellationToken = default)
    {
        if (!IsAdmin() && GetCurrentUserId() != id)
        {
            return Forbid();
        }

        var result = await userService.UpdateAvatarAsync(id, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User with id {id} was not found." });
        }

        return Ok(result);
    }

    private long? GetCurrentUserId()
    {
        var idRaw = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        return long.TryParse(idRaw, out var parsed) ? parsed : null;
    }

    private bool IsAdmin()
    {
        return User.IsInRole("admin");
    }
}
