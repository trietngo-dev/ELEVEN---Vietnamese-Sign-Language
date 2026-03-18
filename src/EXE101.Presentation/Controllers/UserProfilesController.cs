using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.UserProfiles;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/user_profiles")]
public sealed class UserProfilesController(IUserProfileService userProfileService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserProfileRequest request, CancellationToken cancellationToken = default)
    {
        var result = await userProfileService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetProfile), new { userId = result.UserId }, result);
    }

    [HttpPut("{userId:long}")]
    public async Task<IActionResult> Update([FromRoute] long userId, [FromBody] UpdateUserProfileRequest request, CancellationToken cancellationToken = default)
    {
        var result = await userProfileService.UpdateAsync(userId, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User profile with userId {userId} was not found." });
        }

        return Ok(result);
    }

    [HttpGet("{userId:long}")]
    public async Task<IActionResult> GetProfile([FromRoute] long userId, CancellationToken cancellationToken = default)
    {
        var result = await userProfileService.GetByUserIdAsync(userId, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User profile with userId {userId} was not found." });
        }

        return Ok(result);
    }
}
