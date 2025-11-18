using System.Globalization;
using Fanex.Data;
using Fanex.Data.Repository;
using Fanex.Logging;
using Fanex.Logging.Sentry.RavenClient;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.DependencyInjection.Extensions;
using ONEbook.UM.DependencyInjection;
using ONEHub.LandingPages.Core.Constants;
using ONEHub.LandingPages.Core.Extensions;
using ONEHub.LandingPages.Core.Models;
using ONEHub.LandingPages.Core.Services;
using ONEHub.LandingPages.Core.Services.Interfaces;
using ONEHub.LandingPages.Middleware;
using ONEHub.LandingPages.Workers;
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

// Add services to the container.
builder.Services.AddRazorPages().AddViewLocalization()
    .AddDataAnnotationsLocalization();

builder.Services.AddControllers();

builder.Services.AddHttpContextAccessor();
builder.Services.AddTransient<ForwardHeadersHandler>();
builder.Services.AddProxyWithForwardHeadersHttpClient(Settings.UseProxyWithForwardHeaders, builder.Configuration);
builder.Services.AddProxyHttpClient(Settings.UseProxy, builder.Configuration);
builder.Services.AddSingleton<IDynamicRepository, DynamicRepository>();
builder.Services.AddScoped<ISignUpService, SignUpService>();
builder.Services.AddScoped<ILandingPageService, LandingPageService>();
builder.Services.AddScoped<IHttpService, HttpService>();
builder.Services.AddSingleton<ILogProvider, LogProvider>();
builder.Services.AddSingleton<Fanex.Logging.ILogger, Logger>();

// Configure MemberSite options from appsettings.json
builder.Services.Configure<DomainSettings>(builder.Configuration.GetSection("DomainSettings"));
builder.Services.AddSingleton<IDomainSettingService, DomainSettingService>();

// Configure thread pool settings
const short DefaultWorkerThreads = 300;
const short DefaultCompletionPortThreads = 300;
_ = ThreadPool.SetMinThreads(DefaultWorkerThreads, DefaultCompletionPortThreads);

// Initialize Redis connection
RedisConnectionHelper.Initialize(builder.Configuration);
builder.Services.AddSingleton<IConnectionMultiplexer>(sp => RedisConnectionHelper.Connection);
builder.Services.AddSingleton<IRedisService, RedisService>();
builder.Services.AddSingleton<ICacheKeyService, CacheKeyService>();
builder.Services.AddSingleton<IQueueKeyService, QueueKeyService>();
builder.Services.AddScoped<ITrackingSignUpService, TrackingSignUpService>();
builder.Services.TryAddTransient<IUnderMaintenanceService, UnderMaintenanceService>();

builder.Services.AddHostedService<RabbitMqBusHostedService>();
builder.Services.AddSingleton<IRabbitBus, RabbitBus>();

builder.Services.AddOneBookUmForService(builder.Configuration);

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
// Configure data protection
const string DataProtectionKeys = "DataProtectionKeys";
const string ApplicationName = "ONEHub.LandingPage";
var appName = builder.Configuration.GetValue<string>("fanex.caching.redis:ApplicationName");

if (!string.IsNullOrEmpty(appName))
{
    builder.Services.AddDataProtection()
        .PersistKeysToStackExchangeRedis(RedisConnectionHelper.Connection, $"{appName}:{DataProtectionKeys}")
        .SetApplicationName(ApplicationName);
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedHost,
    RequireHeaderSymmetry = false
};

forwardedHeadersOptions.KnownNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();

app.UseForwardedHeaders(forwardedHeadersOptions);

app.UseHttpsRedirection();

var supportedCultures = new[] { "en-US", "vi-VN", "th-TH", "zh-CN", "te-IN" };
var localizationOptions = new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("en-US"),
    SupportedCultures = supportedCultures.Select(c => new CultureInfo(c)).ToList(),
    SupportedUICultures = supportedCultures.Select(c => new CultureInfo(c)).ToList()
};

localizationOptions.RequestCultureProviders = new[]
{
    new CustomRouteDataRequestCultureProvider()
};

app.Use((context, next) =>
{
    var contentSecurityPolicy = builder.Configuration.GetValue<string>("DomainSettings:ContentSecurityPolicy");
    context.Response.Headers.Remove("X-Frame-Options");
    
    if (!string.IsNullOrEmpty(contentSecurityPolicy))
    {
        context.Response.Headers["Content-Security-Policy"] = contentSecurityPolicy;
    }
    
    return next();
});

app.UseRouting();

app.UseMiddleware<UnderMaintenanceMiddleware>();

app.UseRequestLocalization(localizationOptions);
app.MapStaticAssets();
app.MapRazorPages()
   .WithStaticAssets();

app.MapControllers();

try
{
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}