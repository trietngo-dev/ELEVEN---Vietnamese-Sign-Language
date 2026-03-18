using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.UserSettings;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/user_settings")]
public sealed class UserSettingsController(IUserSettingService userSettingService) : ControllerBase
{
    [HttpGet("{userId:long}")]
    public async Task<IActionResult> GetSettings([FromRoute] long userId, CancellationToken cancellationToken = default)
    {
        var result = await userSettingService.GetByUserIdAsync(userId, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"User settings with userId {userId} was not found." });
        }

        return Ok(result);
    }

    [HttpPut("{userId:long}")]
    public async Task<IActionResult> UpdateSettings([FromRoute] long userId, [FromBody] UpdateUserSettingRequest request, CancellationToken cancellationToken = default)
    {
        var result = await userSettingService.UpdateAsync(userId, request, cancellationToken);
        return Ok(result);
    }
}
