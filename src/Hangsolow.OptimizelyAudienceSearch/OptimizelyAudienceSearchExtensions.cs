using EPiServer.Shell.Modules;
using Microsoft.Extensions.DependencyInjection;

namespace Hangsolow.OptimizelyAudienceSearch;

public static class OptimizelyAudienceSearchExtensions
{
    /// <summary>
    /// Registers the Hangsolow.OptimizelyAudienceSearch shell module with Optimizely CMS.
    /// This enables the real-time audience search/filter bar in the "Who can see this content?"
    /// picker in the editorial UI.
    /// </summary>
    public static IServiceCollection AddOptimizelyAudienceSearch(
        this IServiceCollection services)
    {
        services.Configure<ProtectedModuleOptions>(o =>
        {
            const string moduleName = "Hangsolow.OptimizelyAudienceSearch";
            if (!o.Items.Any(i => i.Name.Equals(moduleName, StringComparison.OrdinalIgnoreCase)))
            {
                o.Items.Add(new ModuleDetails { Name = moduleName });
            }
        });

        return services;
    }
}
