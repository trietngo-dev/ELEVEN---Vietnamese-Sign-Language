using System.Globalization;
using System.Net;

namespace EXE101.Application.Emails;

public sealed record EmailMessageContent(string Subject, string TextBody, string HtmlBody);

public static class EmailTemplates
{
    private const string BrandName = "Sign Language Eleven";

    public static EmailMessageContent VerificationCode(
        string recipientName,
        string title,
        string intro,
        string code,
        int expiryMinutes,
        string safetyNote)
    {
        var safeName = string.IsNullOrWhiteSpace(recipientName) ? "bạn" : recipientName.Trim();
        var subject = title;
        var textBody = $"""
        Xin chào {safeName},

        {intro}

        Mã xác nhận: {code}

        Mã này có hiệu lực trong {expiryMinutes} phút.
        {safetyNote}

        Trân trọng,
        {BrandName}
        """;

        var htmlBody = WrapHtml(title, $"""
            <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.7;">Xin chào <strong>{Encode(safeName)}</strong>,</p>
            <p style="margin:0 0 22px;color:#334155;font-size:15px;line-height:1.7;">{Encode(intro)}</p>
            <div style="margin:28px 0;padding:26px 22px;border-radius:18px;background:#f6f9f4;border:1px solid #dfeade;text-align:center;">
              <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#477251;margin-bottom:10px;">Mã xác nhận</div>
              <div style="font-size:42px;line-height:1;font-weight:900;letter-spacing:.18em;color:#17351f;font-family:Arial,Helvetica,sans-serif;">{Encode(code)}</div>
              <div style="margin-top:12px;font-size:13px;color:#64748b;">Có hiệu lực trong {expiryMinutes} phút</div>
            </div>
            <p style="margin:0;color:#64748b;font-size:14px;line-height:1.7;">{Encode(safetyNote)}</p>
            """);

        return new EmailMessageContent(subject, textBody, htmlBody);
    }

    public static EmailMessageContent SubscriptionReceipt(
        string recipientName,
        string planName,
        long amountVnd,
        string orderCode,
        DateTime paidAtUtc,
        DateTime? validUntilUtc)
    {
        var safeName = string.IsNullOrWhiteSpace(recipientName) ? "bạn" : recipientName.Trim();
        var amount = FormatVnd(amountVnd);
        var paidAt = FormatDateTime(paidAtUtc);
        var validUntil = validUntilUtc.HasValue ? FormatDate(validUntilUtc.Value) : "Không giới hạn";
        var subject = $"Biên lai thanh toán {BrandName} - #{orderCode}";

        var textBody = $"""
        Xin chào {safeName},

        Cảm ơn bạn đã thanh toán gói {planName}.

        Mã giao dịch: #{orderCode}
        Số tiền: {amount}
        Thời gian thanh toán: {paidAt}
        Hiệu lực đến: {validUntil}

        Biên lai này xác nhận giao dịch của bạn đã được ghi nhận thành công.

        Trân trọng,
        {BrandName}
        """;

        var rows = $"""
            {ReceiptRow("Mã giao dịch", $"#{orderCode}")}
            {ReceiptRow("Gói đăng ký", planName)}
            {ReceiptRow("Số tiền", amount)}
            {ReceiptRow("Thời gian thanh toán", paidAt)}
            {ReceiptRow("Hiệu lực đến", validUntil)}
            """;

        var htmlBody = WrapHtml("Biên lai thanh toán", $"""
            <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.7;">Xin chào <strong>{Encode(safeName)}</strong>,</p>
            <p style="margin:0 0 22px;color:#334155;font-size:15px;line-height:1.7;">Cảm ơn bạn đã thanh toán thành công gói <strong>{Encode(planName)}</strong>. Dưới đây là biên lai giao dịch của bạn.</p>
            <div style="margin:24px 0;border-radius:18px;border:1px solid #e2e8f0;overflow:hidden;background:#ffffff;">
              <div style="padding:18px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
                <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#477251;">Đã thanh toán</div>
                <div style="margin-top:8px;font-size:28px;font-weight:900;color:#16351f;">{Encode(amount)}</div>
              </div>
              <div style="padding:4px 20px 12px;">{rows}</div>
            </div>
            <p style="margin:0;color:#64748b;font-size:14px;line-height:1.7;">Biên lai này được gửi tự động sau khi giao dịch được xác nhận bởi cổng thanh toán.</p>
            """);

        return new EmailMessageContent(subject, textBody, htmlBody);
    }

    private static string WrapHtml(string title, string content)
        => $"""
        <!doctype html>
        <html>
          <body style="margin:0;padding:0;background:#f4f7f2;font-family:Arial,Helvetica,sans-serif;color:#172334;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f2;padding:32px 12px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e4eadf;box-shadow:0 18px 50px rgba(23,35,52,.08);">
                    <tr>
                      <td style="padding:28px 32px;background:#17351f;color:#ffffff;">
                        <div style="font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#d9e7cc;">{BrandName}</div>
                        <h1 style="margin:12px 0 0;font-size:26px;line-height:1.25;font-weight:900;color:#ffffff;">{Encode(title)}</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px;">{content}</td>
                    </tr>
                    <tr>
                      <td style="padding:22px 32px;background:#f8faf7;border-top:1px solid #e4eadf;color:#718096;font-size:12px;line-height:1.6;">
                        Email này được gửi tự động từ {BrandName}. Vui lòng không chia sẻ mã xác nhận hoặc thông tin giao dịch với người khác.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
        """;

    private static string ReceiptRow(string label, string value)
        => $"""
        <div style="display:flex;justify-content:space-between;gap:18px;padding:14px 0;border-bottom:1px solid #eef2f7;">
          <span style="color:#64748b;font-size:14px;">{Encode(label)}</span>
          <strong style="color:#172334;font-size:14px;text-align:right;">{Encode(value)}</strong>
        </div>
        """;

    private static string FormatVnd(long amount)
    {
        var culture = CultureInfo.GetCultureInfo("vi-VN");
        return string.Format(culture, "{0:N0} đ", amount);
    }

    private static string FormatDateTime(DateTime value)
        => value.ToUniversalTime().AddHours(7).ToString("HH:mm 'ngày' dd/MM/yyyy", CultureInfo.GetCultureInfo("vi-VN"));

    private static string FormatDate(DateTime value)
        => value.ToUniversalTime().AddHours(7).ToString("dd/MM/yyyy", CultureInfo.GetCultureInfo("vi-VN"));

    private static string Encode(string value)
        => WebUtility.HtmlEncode(value);
}
