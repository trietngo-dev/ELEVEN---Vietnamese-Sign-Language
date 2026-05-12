using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface ITranslationSegmentRepository
{
    Task<IReadOnlyList<TranslationSegment>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<TranslationSegment?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<TranslationSegment> AddAsync(TranslationSegment entity, CancellationToken cancellationToken = default);
    Task<TranslationSegment> UpdateAsync(TranslationSegment entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
