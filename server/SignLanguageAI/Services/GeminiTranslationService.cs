using System.Text;
using System.Text.Json;

namespace SignLanguageAI.Services
{
    public class GeminiTranslationService
    {
        private const string DefaultModel = "gemini-1.5-flash";
        private const string SystemInstruction = "Bạn là một chuyên gia phiên dịch Ngôn ngữ ký hiệu Việt Nam (VSL). Người dùng sẽ cung cấp một mảng các từ khóa rời rạc do AI thị giác máy tính nhận diện được. Nhiệm vụ của bạn là sắp xếp, thêm từ nối để biến các từ khóa này thành một câu Tiếng Việt hoàn chỉnh, tự nhiên, đúng ngữ pháp giao tiếp hàng ngày. Tuyệt đối chỉ in ra câu kết quả cuối cùng, không giải thích gì thêm. Nếu mảng từ khóa có vẻ vô nghĩa, hãy cố gắng suy luận ngữ cảnh hợp lý nhất. Nếu mảng trống, trả về chuỗi rỗng.";

        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<GeminiTranslationService> _logger;

        public GeminiTranslationService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<GeminiTranslationService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> TranslateWordsAsync(List<string> words, CancellationToken cancellationToken = default)
        {
            if (words == null || words.Count == 0)
                return string.Empty;

            var apiKey = _configuration["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("Gemini API key is not configured.");
                throw new InvalidOperationException("Gemini API key is missing. Set Gemini:ApiKey or GEMINI_API_KEY.");
            }

            var model = _configuration["Gemini:Model"];
            if (string.IsNullOrWhiteSpace(model))
                model = DefaultModel;

            var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={Uri.EscapeDataString(apiKey)}";

            var userPrompt = $"Mảng từ khóa: [{string.Join(", ", words.Select(w => $"\"{w}\""))}]";

            var requestBody = new
            {
                system_instruction = new
                {
                    parts = new[]
                    {
                        new { text = SystemInstruction }
                    }
                },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[]
                        {
                            new { text = userPrompt }
                        }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.2,
                    topK = 1,
                    topP = 0.9,
                    maxOutputTokens = 128
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Gemini API failed: {StatusCode} - {Body}", response.StatusCode, responseContent);
                throw new HttpRequestException($"Gemini API failed with status {(int)response.StatusCode}: {responseContent}");
            }

            using var document = JsonDocument.Parse(responseContent);
            var root = document.RootElement;

            if (!root.TryGetProperty("candidates", out var candidates) || candidates.GetArrayLength() == 0)
            {
                _logger.LogWarning("Gemini API returned no candidates.");
                return string.Empty;
            }

            var firstCandidate = candidates[0];
            if (!firstCandidate.TryGetProperty("content", out var content) ||
                !content.TryGetProperty("parts", out var parts) ||
                parts.GetArrayLength() == 0)
            {
                _logger.LogWarning("Gemini API returned invalid candidate content.");
                return string.Empty;
            }

            var text = parts[0].GetProperty("text").GetString() ?? string.Empty;
            return text.Trim();
        }
    }
}
