using ONEHub.LandingPages.Core.Services.Interfaces;
using ONEbook.UM.Services;
using ONEHub.Shared.Services.Interfaces;

namespace ONEHub.LandingPages.Consumer;

public sealed class SyncLandingPageToCacheWorker(
    IMaintenanceService maintenanceService,
    ILandingPageService landingPageService,
    ILogProvider logService) : BackgroundService
{
    private const int JobDelayMinute = 1;
    private const int InitialDelayMilliseconds = 10;
    private bool isRunning;

    private bool IsCurrentlyUnderMaintenance()
    {
        var maintenanceTime = maintenanceService.GetUnderMaintenanceTime();
        return maintenanceTime.IsUnderMaintenanceTime;
    }

    private async Task SyncLandingPage()
    {
        if (isRunning || IsCurrentlyUnderMaintenance())
        {
            return;
        }

        isRunning = true;
        try
        {
            await landingPageService.SyncAllLandingPageToCache();
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
            logService.LogFileMessage($"SyncLandingPageToCacheWorker running at: {DateTimeOffset.Now}");
            await SyncLandingPage();
            await Task.Delay(TimeSpan.FromMinutes(JobDelayMinute), stoppingToken).ConfigureAwait(false);
        }
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        return base.StopAsync(cancellationToken);
    }
}
