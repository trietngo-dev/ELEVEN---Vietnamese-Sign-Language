using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/avatar-frames")]
public sealed class AvatarFramesController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var frames = await dbContext.AvatarFrames
            .Where(f => f.IsActive)
            .OrderBy(f => f.XpPrice)
            .ToListAsync(cancellationToken);
        return Ok(frames);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMyOwned(CancellationToken cancellationToken = default)
    {
        var idRaw = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!long.TryParse(idRaw, out var userId))
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var ownedFrameIds = await dbContext.UserAvatarFrames
            .Where(uf => uf.UserId == userId)
            .Select(uf => uf.AvatarFrameId)
            .ToListAsync(cancellationToken);

        var frames = await dbContext.AvatarFrames
            .Where(f => ownedFrameIds.Contains(f.Id))
            .ToListAsync(cancellationToken);

        return Ok(frames);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAvatarFrameRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.ImageUrl))
        {
            return BadRequest(new { message = "Name and ImageUrl are required." });
        }

        var code = "FRAME_" + request.Name.Replace(" ", "_").ToUpperInvariant();
        if (await dbContext.AvatarFrames.AnyAsync(f => f.Code == code, cancellationToken))
        {
            code = code + "_" + DateTime.UtcNow.Ticks;
        }

        var frame = new AvatarFrame
        {
            Code = code,
            Name = request.Name,
            ImageUrl = request.ImageUrl,
            XpPrice = request.XpPrice,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.AvatarFrames.Add(frame);
        await dbContext.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetAll), new { id = frame.Id }, frame);
    }

    [HttpPost("{id:long}/redeem")]
    public async Task<IActionResult> Redeem([FromRoute] long id, CancellationToken cancellationToken = default)
    {
        var idRaw = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!long.TryParse(idRaw, out var userId))
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var frame = await dbContext.AvatarFrames.FindAsync([id], cancellationToken);
        if (frame is null || !frame.IsActive)
        {
            return NotFound(new { message = "Avatar frame not found or inactive." });
        }

        // Check if already owned
        var alreadyOwned = await dbContext.UserAvatarFrames
            .AnyAsync(uf => uf.UserId == userId && uf.AvatarFrameId == id, cancellationToken);
        if (alreadyOwned)
        {
            return BadRequest(new { message = "You already own this avatar frame." });
        }

        // Check user profile XP
        var profile = await dbContext.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (profile is null)
        {
            return NotFound(new { message = "User profile not found." });
        }

        if (profile.TotalXp < frame.XpPrice)
        {
            return BadRequest(new { message = $"Insufficient XP. Required: {frame.XpPrice}, Available: {profile.TotalXp}." });
        }

        // Transaction/atomic updates
        profile.TotalXp -= frame.XpPrice;
        profile.UpdatedAt = DateTime.UtcNow;

        var userFrame = new UserAvatarFrame
        {
            UserId = userId,
            AvatarFrameId = id,
            PurchasedAt = DateTime.UtcNow
        };

        dbContext.UserAvatarFrames.Add(userFrame);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Frame purchased successfully.", totalXp = profile.TotalXp });
    }

    [HttpPatch("equip")]
    public async Task<IActionResult> Equip([FromBody] EquipFrameRequest request, CancellationToken cancellationToken = default)
    {
        var idRaw = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (!long.TryParse(idRaw, out var userId))
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var profile = await dbContext.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
        if (profile is null)
        {
            return NotFound(new { message = "User profile not found." });
        }

        if (request.FrameId.HasValue)
        {
            // Verify ownership
            var ownsFrame = await dbContext.UserAvatarFrames
                .AnyAsync(uf => uf.UserId == userId && uf.AvatarFrameId == request.FrameId.Value, cancellationToken);
            if (!ownsFrame)
            {
                return BadRequest(new { message = "You do not own this avatar frame." });
            }

            profile.ActiveFrameId = request.FrameId.Value;
        }
        else
        {
            profile.ActiveFrameId = null;
        }

        profile.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Avatar frame equipped successfully.", activeFrameId = profile.ActiveFrameId });
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update([FromRoute] long id, [FromBody] CreateAvatarFrameRequest request, CancellationToken cancellationToken = default)
    {
        var frame = await dbContext.AvatarFrames.FindAsync([id], cancellationToken);
        if (frame is null)
        {
            return NotFound(new { message = $"Avatar frame with id {id} not found." });
        }

        frame.Name = request.Name;
        frame.ImageUrl = request.ImageUrl;
        frame.XpPrice = request.XpPrice;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Ok(frame);
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete([FromRoute] long id, CancellationToken cancellationToken = default)
    {
        var frame = await dbContext.AvatarFrames.FindAsync([id], cancellationToken);
        if (frame is null)
        {
            return NotFound(new { message = $"Avatar frame with id {id} not found." });
        }

        dbContext.AvatarFrames.Remove(frame);
        await dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}

public class CreateAvatarFrameRequest
{
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int XpPrice { get; set; }
}

public class EquipFrameRequest
{
    public long? FrameId { get; set; }
}
