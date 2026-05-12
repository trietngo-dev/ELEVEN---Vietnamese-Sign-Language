using EXE101.Application.Models.Common;
using EXE101.Application.Models.LessonVocabularies;

namespace EXE101.Application.Interfaces.Services;

public interface ILessonVocabularyService
{
    Task<PagedResult<LessonVocabularyResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<LessonVocabularyResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<LessonVocabularyResponse> CreateAsync(CreateLessonVocabularyRequest request, CancellationToken cancellationToken = default);
    Task<LessonVocabularyResponse?> UpdateAsync(long id, UpdateLessonVocabularyRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
