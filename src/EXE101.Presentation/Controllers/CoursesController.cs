using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Courses;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/courses")]
public sealed class CoursesController(ICourseService service) : ControllerBase
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
            return NotFound(new { message = $"Course with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCourseRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update([FromRoute] long id, [FromBody] UpdateCourseRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"Course with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost("{id:long}/publish")]
    public async Task<IActionResult> Publish([FromRoute] long id, [FromBody] UpdateCoursePublishRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.PublishAsync(id, request.UpdatedBy, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"Course with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost("{id:long}/unpublish")]
    public async Task<IActionResult> Unpublish([FromRoute] long id, [FromBody] UpdateCoursePublishRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.UnpublishAsync(id, request.UpdatedBy, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"Course with id {id} was not found." });
        }

        return Ok(result);
    }

    public sealed class UpdateCoursePublishRequest
    {
        public long UpdatedBy { get; set; }
    }
}
