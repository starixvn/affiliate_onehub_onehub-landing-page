using ONEHub.LandingPages.Core.Services.Interfaces;
using ONEHub.Shared.Services.Interfaces;

namespace ONEHub.LandingPages.Consumer;

public sealed class SyncUnderMaintenanceInfoToCacheWorker(
    IUnderMaintenanceService underMaintenanceService,
    ILogProvider logService) : BackgroundService
{
    private const int JobDelayMinute = 1;
    private const int InitialDelayMilliseconds = 10;
    private bool isRunning;

    private async Task SyncUnderMaintenanceInfo()
    {
        if (isRunning)
        {
            return;
        }

        isRunning = true;
        try
        {
            await underMaintenanceService.SyncUnderMaintenanceInfoAsync();
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync(ex).ConfigureAwait(false);
        }
        finally
        {
            isRunning = false;
        }
    }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(InitialDelayMilliseconds, stoppingToken).ConfigureAwait(false);

        while (!stoppingToken.IsCancellationRequested)
        {
            logService.LogFileMessage($"SyncUnderMaintenanceInfoToCacheWorker running at: {DateTimeOffset.Now}");
            await SyncUnderMaintenanceInfo();
            await Task.Delay(TimeSpan.FromMinutes(JobDelayMinute), stoppingToken).ConfigureAwait(false);
        }
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        return base.StopAsync(cancellationToken);
    }
}
