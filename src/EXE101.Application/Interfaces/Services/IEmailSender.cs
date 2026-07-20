namespace EXE101.Application.Interfaces.Services;

public interface IEmailSender
{
    Task SendAsync(string toEmail, string subject, string body, string? htmlBody = null, CancellationToken cancellationToken = default);
}
