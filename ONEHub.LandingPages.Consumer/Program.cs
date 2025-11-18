using EasyNetQ;
using Fanex.Data;
using Fanex.Data.Repository;
using Fanex.Logging;
using Fanex.Logging.Sentry.RavenClient;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using ONEbook.UM.DependencyInjection;
using ONEbook.UM.Services;
using ONEHub.LandingPages.Consumer;
using ONEHub.LandingPages.Core;
using ONEHub.LandingPages.Core.Constants;
using ONEHub.LandingPages.Core.Extensions;
using ONEHub.LandingPages.Core.Models;
using ONEHub.LandingPages.Core.Services;
using ONEHub.LandingPages.Core.Services.Interfaces;
using ONEHub.Shared.Redis;
using ONEHub.Shared.Services;
using ONEHub.Shared.Services.Interfaces;
using Serilog;
using SharpRaven;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, loggerConfiguration) =>
{
    loggerConfiguration.ReadFrom.Configuration(context.Configuration);
});

RegisterWorker(builder);

// Configure RabbitMQ
var rabbitMqConnectionString = builder.Configuration["RabbitMQConnectionString"];
if (!string.IsNullOrEmpty(rabbitMqConnectionString))
{
    builder.Services.AddSingleton(RabbitHutch.CreateBus(rabbitMqConnectionString));
}

builder.Services.AddOneBookUmForService(builder.Configuration);
builder.Services.AddHttpContextAccessor();
builder.Services.AddTransient<ForwardHeadersHandler>();
builder.Services.AddSingleton<IMaintenanceService, MaintenanceService>();
builder.Services.AddSingleton<IDynamicRepository, DynamicRepository>();
builder.Services.AddSingleton<ITrackingSignUpService, TrackingSignUpService>();
builder.Services.AddSingleton<IDomainSettingService, DomainSettingService>();
builder.Services.AddSingleton<IUnderMaintenanceService, UnderMaintenanceService>();
RedisConnectionHelper.Initialize(builder.Configuration);
builder.Services.AddSingleton<IConnectionMultiplexer>(sp => RedisConnectionHelper.Connection);
builder.Services.AddSingleton<IRedisService, RedisService>();
builder.Services.AddSingleton<ICacheKeyService, CacheKeyService>();
builder.Services.AddSingleton<IRabbitBus, ONEHub.Shared.Services.RabbitBus>();
builder.Services.AddSingleton<IQueueKeyService, QueueKeyService>();
builder.Services.AddSingleton<ILandingPageService, LandingPageService>();
builder.Services.AddSingleton<Fanex.Logging.ILogger, Logger>();
builder.Services.AddSingleton<ILogProvider, LogProvider>();
builder.Services.Configure<DomainSettings>(builder.Configuration.GetSection("DomainSettings"));
builder.Services.AddProxyWithForwardHeadersHttpClient(Settings.UseProxyWithForwardHeaders, builder.Configuration);
builder.Services.AddProxyHttpClient(Settings.UseProxy, builder.Configuration);
// Configure logging
var env = builder.Configuration["Sentry:Environment"];
var backEndDsn = builder.Configuration["Sentry:Dsn"];
var category = builder.Configuration["Sentry:LogCategory"];

if (!string.IsNullOrEmpty(backEndDsn) && !string.IsNullOrEmpty(category))
{
    LogManager.SetDefaultLogCategory(category).Use(new List<ILogEngine>
    {
        new SentryLogging(new SentryEngineOptions
        {
            Dsn = new Dsn(backEndDsn),
            Environment = env
        })
    });
}

DbSettingProviderManager
    .StartNewSession()
    .Register(builder.Configuration)
    .Run();
var host = builder.Build();

RouteToAction(host);

await host.RunAsync();

static void RouteToAction(WebApplication host)
{
    host.MapGet("/", () => "Affiliate.Link.Consumer running!");
    host.MapGet("/sentry", async () =>
    {
        var logService = host.Services.GetRequiredService<ILogProvider>();
        await logService.SentryErrorAsync("Landing Page Consumer Test Sentry");
        return "Landing Page Consumer Test sentry!";
    });
    host.MapGet("/OnDQLQueueConsumer", async () =>
    {
        var redisService = host.Services.GetRequiredService<IRedisService>();
        var cacheKeyService = host.Services.GetRequiredService<ICacheKeyService>();
        var cachekey = cacheKeyService.GetFullKey(CacheKey.TurnOnErrorQueueConsumer);
        var result = await redisService.SetAsync(cachekey, true);
        return Results.Ok(result);
    });

    host.MapGet("/OffDQLQueueConsumer", async () =>
    {
        var redisService = host.Services.GetRequiredService<IRedisService>();
        var cacheKeyService = host.Services.GetRequiredService<ICacheKeyService>();
        var cachekey = cacheKeyService.GetFullKey(CacheKey.TurnOnErrorQueueConsumer);
        var result = await redisService.SetAsync(cachekey, false);
        return Results.Ok(result);
    });
}

static void RegisterWorker(WebApplicationBuilder builder)
{
    RegisterWorkerIfEnabled<SignUpLogDLQWorker>(builder, "JobSettings:SignUpLogDLQWorker");
    RegisterWorkerIfEnabled<SignUpLogRedisStorageWorker>(builder, "JobSettings:SignUpLogRedisStorageWorker");
    RegisterWorkerIfEnabled<SignUpLogWorker>(builder, "JobSettings:SignUpLogWorker");
    RegisterWorkerIfEnabled<SyncLandingPageToCacheWorker>(builder, "JobSettings:SyncLandingPageToCacheWorker");
    RegisterWorkerIfEnabled<SyncUnderMaintenanceInfoToCacheWorker>(builder, "JobSettings:SyncUnderMaintenanceInfoToCacheWorker");
}

static void RegisterWorkerIfEnabled<T>(WebApplicationBuilder builder, string configKey) where T : class, IHostedService
{
    if (bool.TryParse(builder.Configuration[configKey], out var isEnabled) && isEnabled)
    {
        builder.Services.AddHostedService<T>();
    }
}