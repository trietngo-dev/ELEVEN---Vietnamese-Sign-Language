using System.Security.Claims;
using System.Text.Json;
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
    AppDbContext dbContext) : ControllerBase
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

        // Create transaction in Pending status
        var transaction = new PaymentTransaction
        {
            UserId = userId.Value,
            UserSubscriptionId = null,
            AmountVnd = plan.PriceVnd,
            Currency = "VND",
            PaymentMethod = "VietQR",
            PaymentProvider = "PayOS",
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.PaymentTransactions.Add(transaction);
        await dbContext.SaveChangesAsync(cancellationToken);

        try
        {
            // For PayOS, the description must be alphanumeric and between 1-25 characters.
            var desc = plan.Code.ToLower() == "premium" ? "Eleven Premium" : "Eleven Pro";
            var checkoutUrl = await payOsService.CreatePaymentLinkAsync(
                transaction.Id,
                plan.PriceVnd,
                desc,
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
            transaction.Status = PaymentStatus.Paid;
            transaction.PaidAt = DateTime.UtcNow;
            transaction.ProviderTransactionRef = reference;

            // Find matching subscription plan by amount
            var plan = await dbContext.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.PriceVnd == transaction.AmountVnd && p.IsActive, cancellationToken);

            if (plan != null)
            {
                // Expire existing active subscriptions for this user
                var existingSubs = await dbContext.UserSubscriptions
                    .Where(s => s.UserId == transaction.UserId && s.Status == SubscriptionStatus.Active)
                    .ToListAsync(cancellationToken);

                foreach (var sub in existingSubs)
                {
                    sub.Status = SubscriptionStatus.Expired;
                }

                // Create new subscription
                var userSub = new UserSubscription
                {
                    UserId = transaction.UserId,
                    PlanId = plan.Id,
                    Status = SubscriptionStatus.Active,
                    StartAt = DateTime.UtcNow,
                    EndAt = plan.BillingCycle.ToLower() == "yearly" 
                        ? DateTime.UtcNow.AddYears(1) 
                        : DateTime.UtcNow.AddMonths(1),
                    AutoRenew = true,
                    Source = "PayOS",
                    CreatedAt = DateTime.UtcNow
                };

                dbContext.UserSubscriptions.Add(userSub);
                await dbContext.SaveChangesAsync(cancellationToken);

                transaction.UserSubscriptionId = userSub.Id;
            }

            await dbContext.SaveChangesAsync(cancellationToken);
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
}

public sealed class CreatePaymentLinkRequest
{
    public long PlanId { get; set; }
}
