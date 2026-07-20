using System.Security.Claims;
using System.Text.Json;
using EXE101.Application.Emails;
using EXE101.Application.Interfaces.Services;
using EXE101.Domain.Entities;
using EXE101.Domain.Enums;
using EXE101.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EXE101.Presentation.Controllers;

[ApiController]
[Route("api/payments")]
public sealed class PaymentsController(
    IPayOsService payOsService,
    AppDbContext dbContext,
    IEmailSender emailSender,
    ILogger<PaymentsController> logger) : ControllerBase
{
    [Authorize]
    [HttpPost("create-payment-link")]
    public async Task<IActionResult> CreatePaymentLink([FromBody] CreatePaymentLinkRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var plan = await dbContext.SubscriptionPlans
            .FirstOrDefaultAsync(p => p.Id == request.PlanId && p.IsActive, cancellationToken);
        if (plan == null)
        {
            return NotFound(new { message = $"Active subscription plan with id {request.PlanId} was not found." });
        }

        // Tự động tính số tiền thực tế dựa trên chu kỳ thanh toán yêu cầu
        var amount = plan.PriceVnd;
        var requestCycle = request.BillingCycle?.ToLowerInvariant() ?? "monthly";
        if (requestCycle == "yearly")
        {
            var baseYearlyPrice = plan.PriceVnd * 12;
            var discountPercent = 0;
            // Parse phần trăm giảm giá từ plan.BillingCycle (ví dụ: monthly_20)
            if (!string.IsNullOrEmpty(plan.BillingCycle) && plan.BillingCycle.Contains('_'))
            {
                var parts = plan.BillingCycle.Split('_');
                int.TryParse(parts[parts.Length - 1], out discountPercent);
            }
            // Gói Premium mặc định seed sẵn trong DB có BillingCycle="yearly", cho discount mặc định 40%
            else if (plan.BillingCycle.ToLowerInvariant() == "yearly")
            {
                discountPercent = 40;
            }
            amount = baseYearlyPrice * (100 - discountPercent) / 100;
        }

        // Lưu tạm thông tin PlanId và BillingCycle vào trường PaymentProvider
        var providerInfo = $"PayOS_{plan.Id}_{requestCycle}";

        // Create transaction in Pending status
        var transaction = new PaymentTransaction
        {
            UserId = userId.Value,
            UserSubscriptionId = null,
            AmountVnd = amount,
            Currency = "VND",
            PaymentMethod = "VietQR",
            PaymentProvider = providerInfo,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.PaymentTransactions.Add(transaction);
        await dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            // For PayOS, the description must be alphanumeric and between 1-25 characters.
            var desc = plan.Code.ToUpper() == "PREMIUM" ? "Eleven Premium" : "Eleven Pro";
            if (requestCycle == "yearly") desc += " Yr";
            if (desc.Length > 25) desc = desc.Substring(0, 25);
            
            var checkoutUrl = await payOsService.CreatePaymentLinkAsync(
                transaction.Id,
                amount,
                desc,
                request.ReturnUrl,
                request.CancelUrl,
                cancellationToken
            );

            return Ok(new
            {
                checkoutUrl = checkoutUrl,
                orderCode = transaction.Id
            });
        }
        catch (Exception ex)
        {
            // Update transaction to Failed if integration failed
            transaction.Status = PaymentStatus.Failed;
            await dbContext.SaveChangesAsync(cancellationToken);
            return StatusCode(500, new { message = $"Failed to create payment link: {ex.Message}" });
        }
    }

    [AllowAnonymous]
    [HttpPost("payos-webhook")]
    public async Task<IActionResult> PayOsWebhook(CancellationToken cancellationToken)
    {
        // Read raw body
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync(cancellationToken);

        // Verify webhook signature
        if (!payOsService.VerifyWebhookSignature(body))
        {
            return BadRequest(new { message = "Invalid webhook signature." });
        }

        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;
        
        if (!root.TryGetProperty("data", out var dataEl))
        {
            return BadRequest(new { message = "Data payload is missing." });
        }

        if (!dataEl.TryGetProperty("orderCode", out var orderCodeEl) || 
            !dataEl.TryGetProperty("amount", out var amountEl))
        {
            return BadRequest(new { message = "orderCode or amount is missing in data payload." });
        }

        var orderCode = orderCodeEl.GetInt64();
        var amount = amountEl.GetInt64();
        var reference = dataEl.TryGetProperty("reference", out var refEl) ? refEl.GetString() : null;

        var transaction = await dbContext.PaymentTransactions
            .FirstOrDefaultAsync(t => t.Id == orderCode, cancellationToken);

        if (transaction == null)
        {
            return NotFound(new { message = $"Transaction with orderCode {orderCode} was not found." });
        }

        if (transaction.Status == PaymentStatus.Pending)
        {
            await ProcessPaidTransactionAsync(transaction, reference, cancellationToken);
        }

        return Ok(new { success = true });
    }

    [Authorize]
    [HttpGet("status/{orderCode}")]
    public async Task<IActionResult> GetStatus(long orderCode, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        var transaction = await dbContext.PaymentTransactions
            .FirstOrDefaultAsync(t => t.Id == orderCode, cancellationToken);

        if (transaction == null)
        {
            return NotFound(new { message = $"Transaction with orderCode {orderCode} was not found." });
        }

        if (transaction.UserId != userId.Value)
        {
            return Forbid();
        }

        // Active Polling & Sync with PayOS API if still Pending
        if (transaction.Status == PaymentStatus.Pending)
        {
            var payOsStatus = await payOsService.GetPaymentStatusAsync(orderCode, cancellationToken);
            if (payOsStatus != null)
            {
                if (payOsStatus == "PAID")
                {
                    await ProcessPaidTransactionAsync(transaction, null, cancellationToken);
                }
                else if (payOsStatus == "CANCELLED")
                {
                    transaction.Status = PaymentStatus.Failed;
                    await dbContext.SaveChangesAsync(cancellationToken);
                }
            }
        }

        return Ok(new
        {
            orderCode = transaction.Id,
            status = transaction.Status.ToString(),
            amount = transaction.AmountVnd,
            paidAt = transaction.PaidAt
        });
    }

    private long? GetCurrentUserId()
    {
        var idRaw = User.FindFirstValue(ClaimTypes.NameIdentifier) 
            ?? User.FindFirstValue("sub");

        if (long.TryParse(idRaw, out var userId))
        {
            return userId;
        }

        return null;
    }

    private async Task ProcessPaidTransactionAsync(PaymentTransaction transaction, string? reference, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        transaction.Status = PaymentStatus.Paid;
        transaction.PaidAt = now;
        if (!string.IsNullOrWhiteSpace(reference))
        {
            transaction.ProviderTransactionRef = reference;
        }

        // Parse planId và billingCycle từ trường PaymentProvider
        SubscriptionPlan? plan = null;
        var cycle = "monthly";

        if (transaction.PaymentProvider != null && transaction.PaymentProvider.StartsWith("PayOS_"))
        {
            var parts = transaction.PaymentProvider.Split('_');
            if (parts.Length >= 3 && long.TryParse(parts[1], out var planId))
            {
                plan = await dbContext.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == planId, cancellationToken);
                cycle = parts[2];
            }
        }

        // Fallback về logic cũ nếu không parse được
        if (plan == null)
        {
            plan = await dbContext.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.PriceVnd == transaction.AmountVnd && p.IsActive, cancellationToken);
            if (plan != null)
            {
                cycle = plan.BillingCycle.ToLowerInvariant();
            }
        }

        UserSubscription? userSub = null;
        if (plan != null)
        {
            var existingSubs = await dbContext.UserSubscriptions
                .Where(s => s.UserId == transaction.UserId && s.Status == SubscriptionStatus.Active)
                .ToListAsync(cancellationToken);

            foreach (var sub in existingSubs)
            {
                sub.Status = SubscriptionStatus.Expired;
            }

            userSub = new UserSubscription
            {
                UserId = transaction.UserId,
                PlanId = plan.Id,
                Status = SubscriptionStatus.Active,
                StartAt = now,
                EndAt = cycle == "yearly"
                    ? now.AddYears(1)
                    : now.AddMonths(1),
                AutoRenew = true,
                Source = "PayOS",
                CreatedAt = now
            };

            dbContext.UserSubscriptions.Add(userSub);
            await dbContext.SaveChangesAsync(cancellationToken);
            transaction.UserSubscriptionId = userSub.Id;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        if (plan != null && userSub != null)
        {
            await SendSubscriptionReceiptAsync(transaction, plan, userSub, cancellationToken);
        }
    }

    private async Task SendSubscriptionReceiptAsync(
        PaymentTransaction transaction,
        SubscriptionPlan plan,
        UserSubscription subscription,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == transaction.UserId, cancellationToken);

        if (user is null)
        {
            return;
        }

        var email = EmailTemplates.SubscriptionReceipt(
            user.FullName,
            plan.Name,
            transaction.AmountVnd,
            transaction.Id.ToString(),
            transaction.PaidAt ?? DateTime.UtcNow,
            subscription.EndAt);

        try
        {
            await emailSender.SendAsync(user.Email, email.Subject, email.TextBody, email.HtmlBody, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send payment receipt email for transaction {TransactionId}", transaction.Id);
        }
    }
}

public sealed class CreatePaymentLinkRequest
{
    public long PlanId { get; set; }
    public string? ReturnUrl { get; set; }
    public string? CancelUrl { get; set; }
    public string? BillingCycle { get; set; }
}
