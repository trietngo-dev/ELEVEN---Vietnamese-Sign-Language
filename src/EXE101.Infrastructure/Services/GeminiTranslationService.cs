using System.Net.Http.Json;
using System.Text.Json;
using EXE101.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EXE101.Infrastructure.Services;

public sealed class GeminiTranslationService : IGeminiTranslationService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly ILogger<GeminiTranslationService> _logger;

    public GeminiTranslationService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GeminiTranslationService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;

        if (string.IsNullOrEmpty(_apiKey) || _apiKey.Contains("Dummy"))
            _logger.LogWarning("Gemini:ApiKey is not set. Translation will fall back to raw words.");
        else
            _logger.LogInformation("GeminiTranslationService ready (key prefix: {Prefix})", _apiKey[..Math.Min(8, _apiKey.Length)]);
    }

    public async Task<string> PolishSentenceAsync(List<string> words)
    {
        if (string.IsNullOrEmpty(_apiKey) || _apiKey.Contains("Dummy"))
        {
            _logger.LogWarning("Gemini API Key missing. Returning raw words.");
            return string.Join(" ", words);
        }

        try
        {
            var prompt =
                $"Dưới đây là tập hợp các từ vựng ngôn ngữ ký hiệu rời rạc: {string.Join(", ", words)}. " +
                "Hãy ghép nối và dịch chúng thành một câu tiếng Việt hoàn chỉnh, tự nhiên và đúng ngữ pháp nhất. " +
                "Chỉ cần trả về duy nhất nội dung câu, không cần giải thích gì thêm.";

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                },
                generationConfig = new
                {
                    temperature = 0.1,
                    topK = 32,
                    topP = 1,
                    maxOutputTokens = 256
                }
            };

            // gemini-2.0-flash is a valid, available model
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key={_apiKey}";

            _logger.LogInformation("Calling Gemini for words: {Words}", string.Join(", ", words));
            var response = await _httpClient.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError("Gemini API Error {Code}: {Body}", response.StatusCode, errorBody);
                return string.Join(" ", words);
            }

            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            var sentence = result
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString()?.Trim();

            _logger.LogInformation("Gemini result: {Sentence}", sentence);
            return sentence ?? string.Join(" ", words);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini API call failed");
            return string.Join(" ", words);
        }
    }
}
