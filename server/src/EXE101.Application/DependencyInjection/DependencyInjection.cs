using Microsoft.Extensions.DependencyInjection;

namespace EXE101.Application.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        return services;
    }
}
