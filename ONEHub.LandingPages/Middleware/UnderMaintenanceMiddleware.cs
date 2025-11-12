using ONEHub.LandingPages.Core.Constants;
using ONEHub.LandingPages.Core.Services.Interfaces;
using ONEHub.Shared.Services.Interfaces;

namespace ONEHub.LandingPages.Middleware;

public class UnderMaintenanceMiddleware(RequestDelegate next,
    IDomainSettingService domainSettingService,
    IUnderMaintenanceService underMaintainService,
    ILogProvider logService)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var requestPath = context.Request.Path.Value ?? string.Empty;
        var enableCheckUnderMaintenance = domainSettingService.GetEnableCheckUnderMaintenance();
        if (!ShouldIgnorePath(requestPath) 
            && requestPath.StartsWith("/p1/", StringComparison.OrdinalIgnoreCase)
            && enableCheckUnderMaintenance)
        {
            var currentDomain = context.Request.Host.ToString();
            var isUnderMaintenance = await underMaintainService.GetIsUnderMaintenanceByDomainAsync(currentDomain);
            if (isUnderMaintenance)
            {
                await HandleRedirectAsync(context, requestPath, "Under Maintenance");
                return; // Don't continue processing if under maintenance
            }
        }

        // Process the request
        await next(context);

        // Handle 404 errors AFTER processing
        if (context.Response.StatusCode == 404)
        {
            await HandleNotFoundAsync(context);
        }
    }

    private async Task HandleNotFoundAsync(HttpContext context)
    {
        var requestPath = context.Request.Path.Value ?? string.Empty;
        if (ShouldIgnorePath(requestPath))
        {
            return;
        }

        await HandleRedirectAsync(context, requestPath, "404 Not Found");
    }

    private async Task HandleRedirectAsync(HttpContext context, string requestPath, string errorTitle)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        var requestMethod = context.Request.Method;
        var userAgent = context.Request.Headers.UserAgent.ToString();
        var referer = context.Request.Headers.Referer.ToString();
        var remoteIp = GetClientIpAddress(context);
        var currentDomain = domainSettingService.GetCurrentLandingPageDomain(context.Request);

        await logService.SentryInfoAsync(
            $"{errorTitle}: {requestMethod} {currentDomain} {requestPath} from IP {remoteIp} with User-Agent: " +
                $"{userAgent} and Referer: {referer}");

        // Extract language code from p1/langcode pattern
        var languageCode = ExtractLanguageCodeFromPath(requestPath);
        var redirectLink = domainSettingService.GetCurrentMemberSiteJoin(context.Request, languageCode);
        var queryString = context.Request.QueryString.HasValue ? context.Request.QueryString.Value : string.Empty;
        context.Response.Redirect($"{redirectLink}{queryString}");
    }

    private static bool ShouldIgnorePath(string path)
    {
        if (string.IsNullOrEmpty(path))
        {
            return true;
        }

        // Ignore static file extensions
        var staticFileExtensions = new[]
        {
            ".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff", ".woff2", ".ttf", ".eot"
        };

        if (Array.Exists(staticFileExtensions, ext => path.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        // Ignore API endpoints
        if (path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // Ignore health check endpoints
        if (path.Equals("/healthz", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // Ignore favicon requests
        if (path.Equals("/favicon.ico", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return false;
    }

    private static string ExtractLanguageCodeFromPath(string requestPath)
    {
        // Extract language code from p1/langcode pattern
        // Example: /p1/en -> en, /p1/vn -> vn, /p1/th -> th
        if (string.IsNullOrEmpty(requestPath) || !requestPath.StartsWith("/p1/", StringComparison.OrdinalIgnoreCase))
        {
            return string.Empty;
        }

        var pathSegments = requestPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        if (pathSegments.Length >= 2)
        {
            var languageCode = pathSegments[1];
            
            // Check if language code is supported in LanguageToCultureMapInternal
            if (CultureMappingConstants.IsLanguageSupported(languageCode))
            {
                return languageCode;
            }
        }

        return string.Empty;
    }

    private static string GetClientIpAddress(HttpContext context)
    {
        var realIp = context.Request.Headers["x-actual-ip"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }
        else
        {
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
    }
}
