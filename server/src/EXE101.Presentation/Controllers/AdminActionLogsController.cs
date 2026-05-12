using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.AdminActionLogs;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/admin_action_logs")]
public sealed class AdminActionLogsController(IAdminActionLogService service) : ControllerBase
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
            return NotFound(new { message = $"Admin action log with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAdminActionLogRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}
