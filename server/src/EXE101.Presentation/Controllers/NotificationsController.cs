using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Notifications;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/notifications")]
public sealed class NotificationsController(INotificationService service) : ControllerBase
{
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
            return NotFound(new { message = $"Notification with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateNotificationRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update([FromRoute] long id, [FromBody] UpdateNotificationRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"Notification with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete([FromRoute] long id, CancellationToken cancellationToken = default)
    {
        var deleted = await service.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound(new { message = $"Notification with id {id} was not found." });
        }

        return NoContent();
    }
}
