using System.Net;
using ONEHub.LandingPages.Core.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ONEHub.LandingPages.Core.Extensions;

public static class HttpClientProxyExtensions
{
    public static IServiceCollection AddProxyHttpClient(
        this IServiceCollection services,
        string name,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(name);
        ArgumentNullException.ThrowIfNull(configuration);

        var proxyOptions = new ProxyOptions();
        configuration.Bind("HttpClients:withProxy", proxyOptions);

        services.AddHttpClient(name)
            .ConfigurePrimaryHttpMessageHandler(() => GetPrimaryHttpMessageHandler(proxyOptions));

        return services;
    }

    public static IServiceCollection AddProxyWithForwardHeadersHttpClient(
        this IServiceCollection services,
        string name,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(name);
        ArgumentNullException.ThrowIfNull(configuration);

        var proxyOptions = new ProxyOptions();
        configuration.Bind("HttpClients:withProxy", proxyOptions);

        services.AddHttpClient(name)
            .AddHttpMessageHandler<ForwardHeadersHandler>()
            .ConfigurePrimaryHttpMessageHandler(() => GetPrimaryHttpMessageHandler(proxyOptions));

        return services;
    }

    private static HttpMessageHandler GetPrimaryHttpMessageHandler(ProxyOptions proxyOptions)
    {
        ArgumentNullException.ThrowIfNull(proxyOptions);

        if (!proxyOptions.IsUseProxy)
        {
            return new HttpClientHandler();
        }

        var proxy = new WebProxy(proxyOptions.ProxyUrl)
        {
            BypassProxyOnLocal = false,
            UseDefaultCredentials = string.IsNullOrEmpty(proxyOptions.Username)
        };

        if (!string.IsNullOrEmpty(proxyOptions.Username) && !string.IsNullOrEmpty(proxyOptions.Password))
        {
            proxy.Credentials = new NetworkCredential(proxyOptions.Username, proxyOptions.Password);
        }

        return new HttpClientHandler
        {
            Proxy = proxy,
            UseProxy = true
        };
    }
}
