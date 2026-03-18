using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Enrollments;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/enrollments")]
public sealed class EnrollmentsController(IEnrollmentService service) : ControllerBase
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
            return NotFound(new { message = $"Enrollment with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost("enroll")]
    public async Task<IActionResult> EnrollCourse([FromBody] EnrollCourseRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.EnrollCourseAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("user/{userId:long}")]
    public async Task<IActionResult> GetByUser([FromRoute] long userId, CancellationToken cancellationToken = default)
    {
        var result = await service.GetEnrollmentsByUserAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpPatch("{id:long}/current-progress")]
    public async Task<IActionResult> UpdateCurrentProgress([FromRoute] long id, [FromBody] UpdateEnrollmentProgressRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.UpdateCurrentProgressAsync(id, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"Enrollment with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost("{id:long}/complete")]
    public async Task<IActionResult> CompleteEnrollment([FromRoute] long id, [FromBody] CompleteEnrollmentRequest request, CancellationToken cancellationToken = default)
    {
        var result = await service.CompleteEnrollmentAsync(id, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"Enrollment with id {id} was not found." });
        }

        return Ok(result);
    }
}
