namespace EXE101.Application.Models.Common;

public sealed class PagedResult<T>
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int Total { get; set; }
    public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();
}
