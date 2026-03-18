namespace EXE101.Application.Models.LessonVocabularies;

public sealed class CreateLessonVocabularyRequest
{
    public long LessonId { get; set; }
    public long VocabularyId { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public decimal ExpectedAccuracy { get; set; }
}

public sealed class UpdateLessonVocabularyRequest
{
    public long LessonId { get; set; }
    public long VocabularyId { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public decimal ExpectedAccuracy { get; set; }
}

public sealed class LessonVocabularyResponse
{
    public long Id { get; set; }
    public long LessonId { get; set; }
    public long VocabularyId { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public decimal ExpectedAccuracy { get; set; }
    public DateTime CreatedAt { get; set; }
}
