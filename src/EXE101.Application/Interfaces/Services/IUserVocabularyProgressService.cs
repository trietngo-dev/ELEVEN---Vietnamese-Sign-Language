using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserVocabularyProgress;

namespace EXE101.Application.Interfaces.Services;

public interface IUserVocabularyProgressService
{
    Task<PagedResult<UserVocabularyProgressResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<UserVocabularyProgressResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<UserVocabularyProgressResponse> CreateAsync(CreateUserVocabularyProgressRequest request, CancellationToken cancellationToken = default);
    Task<UserVocabularyProgressResponse?> UpdateAsync(long id, UpdateUserVocabularyProgressRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default);
}
