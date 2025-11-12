using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using ONEHub.LandingPages.Core.Models;
using ONEHub.LandingPages.Core.Constants;

namespace ONEHub.LandingPages.Core.Extensions;
public static class HeaderForwardingHelper
{
    private static readonly string[] ForwardHeaderNames =
    [
        "x-forwarded-for",
        "x-forwarded-host",
        "x-client-ip",
        "User-Agent",
        "x-assigned-client-ip"
    ];

    public static IDictionary<string, string> BuildForwardHeaders(HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        var headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var memberSiteOptions = context.RequestServices.GetService<IOptions<DomainSettings>>();
        headers["ai-host"] = memberSiteOptions?.Value?.MainMemberSite ?? string.Empty;
        headers["origin-host"] = $"{LandingPageConstants.HttpsScheme}://{context.Request.Host}";
        headers["x-assigned-client-ip"] = GetClientIpAddress(context);

        foreach (var headerName in ForwardHeaderNames)
        {
            if (context.Request.Headers.TryGetValue(headerName, out var value) && !string.IsNullOrWhiteSpace(value))
            {
                headers[headerName] = value.ToString();
            }
        }

        return headers;
    }

    public static string GetClientIpAddress(HttpContext httpContext)
    {
        var realIp = httpContext.Request.Headers["x-actual-ip"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp))
        {
            return realIp;
        }
        else
        {
            var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }
        }

        return httpContext.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
    }
}
