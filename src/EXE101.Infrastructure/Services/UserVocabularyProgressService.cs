using EXE101.Application.Interfaces.Repositories;
using EXE101.Application.Interfaces.Services;
using EXE101.Application.Models.Common;
using EXE101.Application.Models.UserVocabularyProgress;
using EXE101.Domain.Entities;
using EXE101.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Infrastructure.Services;

public sealed class UserVocabularyProgressService(
    IUserVocabularyProgressRepository repository,
    AppDbContext dbContext) : IUserVocabularyProgressService
{
    private readonly IUserVocabularyProgressRepository _repository = repository;
    private readonly AppDbContext _dbContext = dbContext;

    public async Task<PagedResult<UserVocabularyProgressResponse>> GetPagedAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedPageSize = Math.Clamp(pageSize, 1, 200);

        var total = await _repository.CountAsync(cancellationToken);
        var entities = await _repository.GetPagedAsync(normalizedPage, normalizedPageSize, cancellationToken);

        return new PagedResult<UserVocabularyProgressResponse>
        {
            Page = normalizedPage,
            PageSize = normalizedPageSize,
            Total = total,
            Items = entities.Select(Map).ToList()
        };
    }

    public async Task<UserVocabularyProgressResponse?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<UserVocabularyProgressResponse> CreateAsync(CreateUserVocabularyProgressRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateDependenciesAsync(request.UserId, request.VocabularyId, cancellationToken);
        ValidateMetrics(request.MasteryLevel, request.TotalPracticeCount, request.CorrectCount, request.BestConfidence);

        var exists = await _repository.ExistsByUserAndVocabularyAsync(request.UserId, request.VocabularyId, cancellationToken: cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException("User vocabulary progress already exists.");
        }

        var entity = new UserVocabularyProgress
        {
            UserId = request.UserId,
            VocabularyId = request.VocabularyId,
            Status = request.Status,
            FirstLearnedAt = request.FirstLearnedAt,
            LastPracticedAt = request.LastPracticedAt,
            MasteryLevel = request.MasteryLevel,
            TotalPracticeCount = request.TotalPracticeCount,
            CorrectCount = request.CorrectCount,
            BestConfidence = request.BestConfidence,
            IsSaved = request.IsSaved,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return Map(created);
    }

    public async Task<UserVocabularyProgressResponse?> UpdateAsync(long id, UpdateUserVocabularyProgressRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        ValidateMetrics(request.MasteryLevel, request.TotalPracticeCount, request.CorrectCount, request.BestConfidence);

        entity.Status = request.Status;
        entity.FirstLearnedAt = request.FirstLearnedAt;
        entity.LastPracticedAt = request.LastPracticedAt;
        entity.MasteryLevel = request.MasteryLevel;
        entity.TotalPracticeCount = request.TotalPracticeCount;
        entity.CorrectCount = request.CorrectCount;
        entity.BestConfidence = request.BestConfidence;
        entity.IsSaved = request.IsSaved;
        entity.UpdatedAt = DateTime.UtcNow;

        var updated = await _repository.UpdateAsync(entity, cancellationToken);
        return Map(updated);
    }

    public Task<bool> DeleteAsync(long id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    private async Task ValidateDependenciesAsync(long userId, long vocabularyId, CancellationToken cancellationToken)
    {
        var userExists = await _dbContext.Users.AsNoTracking().AnyAsync(x => x.Id == userId, cancellationToken);
        if (!userExists)
        {
            throw new InvalidOperationException("User does not exist.");
        }

        var vocabularyExists = await _dbContext.Vocabularies.AsNoTracking().AnyAsync(x => x.Id == vocabularyId, cancellationToken);
        if (!vocabularyExists)
        {
            throw new InvalidOperationException("Vocabulary does not exist.");
        }
    }

    private static void ValidateMetrics(decimal masteryLevel, int totalPracticeCount, int correctCount, decimal bestConfidence)
    {
        if (masteryLevel < 0 || masteryLevel > 100)
        {
            throw new InvalidOperationException("MasteryLevel must be in range 0-100.");
        }

        if (bestConfidence < 0 || bestConfidence > 100)
        {
            throw new InvalidOperationException("BestConfidence must be in range 0-100.");
        }

        if (totalPracticeCount < 0 || correctCount < 0)
        {
            throw new InvalidOperationException("Practice counts must be greater than or equal to zero.");
        }
    }

    private static UserVocabularyProgressResponse Map(UserVocabularyProgress entity)
    {
        return new UserVocabularyProgressResponse
        {
            Id = entity.Id,
            UserId = entity.UserId,
            VocabularyId = entity.VocabularyId,
            Status = entity.Status,
            FirstLearnedAt = entity.FirstLearnedAt,
            LastPracticedAt = entity.LastPracticedAt,
            MasteryLevel = entity.MasteryLevel,
            TotalPracticeCount = entity.TotalPracticeCount,
            CorrectCount = entity.CorrectCount,
            BestConfidence = entity.BestConfidence,
            IsSaved = entity.IsSaved,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
