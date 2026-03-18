namespace EXE101.Domain.Entities;

public sealed class LessonVocabulary
{
    public long Id { get; set; }
    public long LessonId { get; set; }
    public long VocabularyId { get; set; }
    public int SortOrder { get; set; }
    public bool IsRequired { get; set; }
    public decimal ExpectedAccuracy { get; set; }
    public DateTime CreatedAt { get; set; }
}
