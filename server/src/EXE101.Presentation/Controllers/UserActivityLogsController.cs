using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.UserActivityLogs;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/user_activity_logs")]
public sealed class UserActivityLogsController(IUserActivityLogService service) : ControllerBase
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
            return NotFound(new { message = $"User activity log with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserActivityLogRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}
