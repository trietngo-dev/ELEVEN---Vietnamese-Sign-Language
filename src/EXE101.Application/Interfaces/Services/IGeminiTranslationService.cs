namespace EXE101.Application.Interfaces.Services;

public interface IGeminiTranslationService
{
    Task<string> PolishSentenceAsync(List<string> words);
}
