using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using EXE101.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;

namespace EXE101.Infrastructure.Services;

public sealed class PayOsService : IPayOsService
{
    private readonly HttpClient _httpClient;
    private readonly string _clientId;
    private readonly string _apiKey;
    private readonly string _checksumKey;
    private readonly string _cancelUrl;
    private readonly string _returnUrl;

    public PayOsService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _clientId = configuration["PayOS:ClientId"] ?? string.Empty;
        _apiKey = configuration["PayOS:ApiKey"] ?? string.Empty;
        _checksumKey = configuration["PayOS:ChecksumKey"] ?? string.Empty;
        _cancelUrl = configuration["PayOS:CancelUrl"] ?? string.Empty;
        _returnUrl = configuration["PayOS:ReturnUrl"] ?? string.Empty;
    }

    public async Task<string> CreatePaymentLinkAsync(long orderCode, long amount, string description, string? returnUrl = null, string? cancelUrl = null, CancellationToken cancellationToken = default)
    {
        var finalCancelUrl = !string.IsNullOrEmpty(cancelUrl) ? cancelUrl : _cancelUrl;
        var finalReturnUrl = !string.IsNullOrEmpty(returnUrl) ? returnUrl : _returnUrl;

        // Generate signature using alphabetically sorted parameters: amount, cancelUrl, description, orderCode, returnUrl
        var signatureData = $"amount={amount}&cancelUrl={finalCancelUrl}&description={description}&orderCode={orderCode}&returnUrl={finalReturnUrl}";
        var signature = ComputeHmacSha256(signatureData, _checksumKey);

        var payload = new
        {
            orderCode = orderCode,
            amount = amount,
            description = description,
            cancelUrl = finalCancelUrl,
            returnUrl = finalReturnUrl,
            signature = signature
        };

        var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://api-merchant.payos.vn/v2/payment-requests")
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        requestMessage.Headers.Add("x-client-id", _clientId);
        requestMessage.Headers.Add("x-api-key", _apiKey);

        var response = await _httpClient.SendAsync(requestMessage, cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(responseContent);
        var root = doc.RootElement;
        
        if (root.GetProperty("code").GetString() != "00")
        {
            throw new Exception($"PayOS error: {root.GetProperty("desc").GetString()}");
        }

        return root.GetProperty("data").GetProperty("checkoutUrl").GetString() ?? string.Empty;
    }

    public bool VerifyWebhookSignature(string webhookBodyJson)
    {
        try
        {
            using var doc = JsonDocument.Parse(webhookBodyJson);
            var root = doc.RootElement;
            
            if (!root.TryGetProperty("data", out var dataEl) || !root.TryGetProperty("signature", out var signatureEl))
            {
                return false;
            }

            var signature = signatureEl.GetString();
            if (string.IsNullOrEmpty(signature)) return false;

            // Sort keys of the 'data' object alphabetically
            var properties = new List<(string Key, string Value)>();
            foreach (var prop in dataEl.EnumerateObject())
            {
                var valStr = prop.Value.ValueKind switch
                {
                    JsonValueKind.String => prop.Value.GetString(),
                    JsonValueKind.Number => prop.Value.GetRawText(),
                    JsonValueKind.True => "true",
                    JsonValueKind.False => "false",
                    JsonValueKind.Null => "null",
                    _ => prop.Value.GetRawText()
                };
                properties.Add((prop.Name, valStr ?? string.Empty));
            }

            properties.Sort((a, b) => string.Compare(a.Key, b.Key, StringComparison.Ordinal));

            var dataString = string.Join("&", properties.Select(p => $"{p.Key}={p.Value}"));
            var computedSignature = ComputeHmacSha256(dataString, _checksumKey);

            return string.Equals(signature, computedSignature, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    public async Task<string?> GetPaymentStatusAsync(long orderCode, CancellationToken cancellationToken)
    {
        try
        {
            var requestMessage = new HttpRequestMessage(HttpMethod.Get, $"https://api-merchant.payos.vn/v2/payment-requests/{orderCode}");
            requestMessage.Headers.Add("x-client-id", _clientId);
            requestMessage.Headers.Add("x-api-key", _apiKey);

            var response = await _httpClient.SendAsync(requestMessage, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(responseContent);
            var root = doc.RootElement;

            if (root.GetProperty("code").GetString() != "00")
            {
                return null;
            }

            return root.GetProperty("data").GetProperty("status").GetString();
        }
        catch
        {
            return null;
        }
    }

    private static string ComputeHmacSha256(string data, string key)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var dataBytes = Encoding.UTF8.GetBytes(data);
        using var hmac = new HMACSHA256(keyBytes);
        var hashBytes = hmac.ComputeHash(dataBytes);
        return Convert.ToHexString(hashBytes).ToLower();
    }
}
