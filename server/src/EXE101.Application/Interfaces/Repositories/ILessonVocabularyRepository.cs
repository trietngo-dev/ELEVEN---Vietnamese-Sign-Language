using EXE101.Domain.Entities;

namespace EXE101.Application.Interfaces.Repositories;

public interface ILessonVocabularyRepository
{
    Task<IReadOnlyList<LessonVocabulary>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(CancellationToken cancellationToken = default);
    Task<LessonVocabulary?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByLessonAndVocabularyAsync(long lessonId, long vocabularyId, long? excludeId = null, CancellationToken cancellationToken = default);
    Task<LessonVocabulary> AddAsync(LessonVocabulary entity, CancellationToken cancellationToken = default);
    Task<LessonVocabulary> UpdateAsync(LessonVocabulary entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
