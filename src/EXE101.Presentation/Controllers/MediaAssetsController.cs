using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.MediaAssets;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/media_assets")]
public sealed class MediaAssetsController(IMediaAssetService mediaAssetService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetMediaAssets([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await mediaAssetService.GetPagedAsync(page, pageSize, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:long}")]
    [AllowAnonymous]
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

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadMediaAsset(
        IFormFile file,
        [FromForm] long? ownerUserId,
        [FromForm] int? durationSeconds,
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            throw new InvalidOperationException("File is required.");
        }

        await using var stream = file.OpenReadStream();
        var result = await mediaAssetService.UploadAsync(stream, new UploadMediaAssetRequest
        {
            OwnerUserId = ownerUserId,
            FileName = file.FileName,
            MimeType = file.ContentType,
            FileSizeBytes = file.Length,
            DurationSeconds = durationSeconds
        }, cancellationToken);

        return Ok(result);
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
