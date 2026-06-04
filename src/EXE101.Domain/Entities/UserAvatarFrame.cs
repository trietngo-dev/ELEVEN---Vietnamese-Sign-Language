using System;

namespace EXE101.Domain.Entities;

public sealed class UserAvatarFrame
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long AvatarFrameId { get; set; }
    public DateTime PurchasedAt { get; set; }
}
