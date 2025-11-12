#nullable enable
using EasyNetQ;
using ONEHub.Shared.Services.Interfaces;

namespace ONEHub.LandingPages.Workers;

public class RabbitMqBusHostedService : BackgroundService
{
    private readonly ILogProvider logService;
    private readonly IConfiguration configuration;

    private IBus? bus;
    private readonly IRabbitBus rabbitBus;
    private readonly SemaphoreSlim connectionLock = new(1, 1);
    private bool isConnected;

    public RabbitMqBusHostedService(
        ILogProvider logService,
        IConfiguration configuration,
      IRabbitBus rabbitBus)
    {
        this.logService = logService;
        this.configuration = configuration;
        this.rabbitBus = rabbitBus;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var connStr = configuration.GetValue<string>("RabbitMQConnectionString");
        if (string.IsNullOrEmpty(connStr))
        {
            await logService.SentryErrorAsync("RabbitMQ connection string is not configured");
        }

        bus = RabbitHutch.CreateBus(connStr);
       
        bus.Advanced.Disconnected += async (_, _) =>
        {
            isConnected = false; // Reset connection state
            await TryConnectToRabbitMqAsync(stoppingToken);
            logService.LogFileMessage("RabbitMQ disconnected.");
        };

        await TryConnectToRabbitMqAsync(stoppingToken);
        logService.LogFileMessage("RabbitMQ connected and ready.");

    }

    public override void Dispose()
    {
        bus?.Dispose();
        base.Dispose();
    }

    private async Task TryConnectToRabbitMqAsync(CancellationToken stoppingToken)
    {
        if (!await connectionLock.WaitAsync(0))
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested && !isConnected)
        {
            try
            {
                rabbitBus.SetBus(bus!.Advanced);
                await rabbitBus.RegisterQueueAsync();
                isConnected = true;
            }
            catch (Exception ex)
            {
                isConnected = false;
                await logService.SentryErrorAsync("RabbitMQ connect failed. Retrying in 10s...", ex);
                logService.LogFileError(ex);
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }
        }

        connectionLock.Release();
    }
}
