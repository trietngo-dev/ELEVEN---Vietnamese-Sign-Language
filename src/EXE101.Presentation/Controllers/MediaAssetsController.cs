using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.MediaAssets;
using Microsoft.AspNetCore.Mvc;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/media_assets")]
public sealed class MediaAssetsController(IMediaAssetService mediaAssetService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMediaAssets([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await mediaAssetService.GetPagedAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetMediaAsset([FromRoute] long id, CancellationToken cancellationToken = default)
    {
        var result = await mediaAssetService.GetByIdAsync(id, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"Media asset with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateMediaAsset([FromBody] CreateMediaAssetRequest request, CancellationToken cancellationToken = default)
    {
        var result = await mediaAssetService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetMediaAsset), new { id = result.Id }, result);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> UpdateMediaAsset([FromRoute] long id, [FromBody] UpdateMediaAssetRequest request, CancellationToken cancellationToken = default)
    {
        var result = await mediaAssetService.UpdateAsync(id, request, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"Media asset with id {id} was not found." });
        }

        return Ok(result);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> ArchiveMediaAsset([FromRoute] long id, CancellationToken cancellationToken = default)
    {
        var result = await mediaAssetService.ArchiveAsync(id, cancellationToken);
        if (result is null)
        {
            return NotFound(new { message = $"Media asset with id {id} was not found." });
        }

        return Ok(result);
    }
}
