using System.Security.Claims;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.UserSubscriptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/user_subscriptions")]
public sealed class UserSubscriptionsController(IUserSubscriptionService service) : ControllerBase
{
    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentActiveSubscription(CancellationToken cancellationToken = default)
    {
        var idRaw = User.FindFirstValue(ClaimTypes.NameIdentifier) 
            ?? User.FindFirstValue("sub");

        if (!long.TryParse(idRaw, out var userId))
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var result = await service.GetActiveByUserIdAsync(userId, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = "No active subscription found for the current user." });
        }

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await service.GetPagedAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById([FromRoute] long id, CancellationToken cancellationToken = default)
    {
        var result = await service.GetByIdAsync(id, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User subscription with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update([FromRoute] long id, [FromBody] UpdateUserSubscriptionRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User subscription with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete([FromRoute] long id, CancellationToken cancellationToken = default)
    {
        var deleted = await service.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new { message = $"User subscription with id {id} was not found." });
        }

        return NoContent();
    }
}
