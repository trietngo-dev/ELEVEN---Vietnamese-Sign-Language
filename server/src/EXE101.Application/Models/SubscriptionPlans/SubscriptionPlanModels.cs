namespace EXE101.Application.Models.SubscriptionPlans;

public sealed class CreateSubscriptionPlanRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public long PriceVnd { get; set; }
    public int DailyTranslationLimit { get; set; }
    public int AiPracticeLimit { get; set; }
    public string CourseAccessScope { get; set; } = string.Empty;
    public bool CanSaveHistory { get; set; }
    public bool CertificateEnabled { get; set; }
    public bool PrioritySupport { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
}

public sealed class UpdateSubscriptionPlanRequest
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public long PriceVnd { get; set; }
    public int DailyTranslationLimit { get; set; }
    public int AiPracticeLimit { get; set; }
    public string CourseAccessScope { get; set; } = string.Empty;
    public bool CanSaveHistory { get; set; }
    public bool CertificateEnabled { get; set; }
    public bool PrioritySupport { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
}

public sealed class SubscriptionPlanResponse
{
    public long Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string BillingCycle { get; set; } = string.Empty;
    public long PriceVnd { get; set; }
    public int DailyTranslationLimit { get; set; }
    public int AiPracticeLimit { get; set; }
    public string CourseAccessScope { get; set; } = string.Empty;
    public bool CanSaveHistory { get; set; }
    public bool CertificateEnabled { get; set; }
    public bool PrioritySupport { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}
