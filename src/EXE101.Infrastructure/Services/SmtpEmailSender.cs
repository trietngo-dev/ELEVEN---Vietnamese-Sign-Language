using System.Net;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using EXE101.Application.Interfaces.Services;
using Microsoft.Extensions.Options;

namespace EXE101.Infrastructure.Services;

public sealed class SmtpEmailSender(IOptions<SmtpEmailOptions> options, HttpClient httpClient) : IEmailSender
{
    private const string ResendSmtpHost = "smtp.resend.com";
    private const string ResendEmailsEndpoint = "https://api.resend.com/emails";

    private readonly SmtpEmailOptions _options = options.Value;
    private readonly HttpClient _httpClient = httpClient;

    public async Task SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.Host) || string.IsNullOrWhiteSpace(_options.FromEmail))
        {
            throw new InvalidOperationException("SMTP email settings are not configured.");
        }

        if (IsResendConfigured())
        {
            await SendWithResendApiAsync(toEmail, subject, body, cancellationToken);
            return;
        }

        using var message = new MailMessage
        {
            From = new MailAddress(_options.FromEmail, _options.FromName),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };
        message.To.Add(new MailAddress(toEmail));

        using var client = new SmtpClient(_options.Host, _options.Port)
        {
            EnableSsl = _options.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = Math.Max(1, _options.TimeoutSeconds) * 1000
        };

        if (!string.IsNullOrWhiteSpace(_options.Username))
        {
            client.Credentials = new NetworkCredential(_options.Username, _options.Password);
        }

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromSeconds(Math.Max(1, _options.TimeoutSeconds)));

        try
        {
            await client.SendMailAsync(message, timeoutCts.Token);
        }
        catch (Exception ex) when (ex is SmtpException or OperationCanceledException or TimeoutException)
        {
            throw new InvalidOperationException("Email sending failed. Please check SMTP provider settings.", ex);
        }
    }

    private bool IsResendConfigured()
        => string.Equals(_options.Host, ResendSmtpHost, StringComparison.OrdinalIgnoreCase)
            || string.Equals(_options.Username, "resend", StringComparison.OrdinalIgnoreCase);

    private async Task SendWithResendApiAsync(string toEmail, string subject, string body, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.Password))
        {
            throw new InvalidOperationException("Resend API key is not configured.");
        }

        var from = string.IsNullOrWhiteSpace(_options.FromName)
            ? _options.FromEmail
            : $"{_options.FromName} <{_options.FromEmail}>";

        var payload = new
        {
            from,
            to = new[] { toEmail },
            subject,
            text = body
        };

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(TimeSpan.FromSeconds(Math.Max(1, _options.TimeoutSeconds)));

        using var request = new HttpRequestMessage(HttpMethod.Post, ResendEmailsEndpoint)
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.Password);

        try
        {
            using var response = await _httpClient.SendAsync(request, timeoutCts.Token);
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"Resend email sending failed ({(int)response.StatusCode}). {errorBody}");
        }
        catch (OperationCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            throw new InvalidOperationException("Resend email sending timed out.", ex);
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException("Resend email sending failed. Please check network access and API key.", ex);
        }
    }
}
