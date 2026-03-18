using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.AuthAccounts;
using EXE101.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/auth_accounts")]
public sealed class AuthAccountsController(IAuthAccountService authAccountService) : ControllerBase
{
    [HttpPost("link")]
    public async Task<IActionResult> LinkProvider([FromBody] LinkAuthProviderRequest request, CancellationToken cancellationToken = default)
    {
        var result = await authAccountService.LinkProviderAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetLinkedByUser), new { userId = result.UserId }, result);
    }

    [HttpGet("user/{userId:long}")]
    public async Task<IActionResult> GetLinkedByUser([FromRoute] long userId, CancellationToken cancellationToken = default)
    {
        var result = await authAccountService.GetLinkedAccountsByUserAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("user/{userId:long}/provider/{provider}")]
    public async Task<IActionResult> UnlinkProvider([FromRoute] long userId, [FromRoute] AuthProvider provider, CancellationToken cancellationToken = default)
    {
        var removed = await authAccountService.UnlinkProviderAsync(userId, provider, cancellationToken);
        if (!removed)
        {
            return NotFound(new { message = $"Provider {provider} was not linked for user {userId}." });
        }

        return NoContent();
    }
}
