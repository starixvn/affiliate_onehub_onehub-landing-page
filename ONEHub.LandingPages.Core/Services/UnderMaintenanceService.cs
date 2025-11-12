using System.Text.Json;
using ONEHub.LandingPages.Core.Constants;
using ONEHub.LandingPages.Core.Converters;
using ONEHub.LandingPages.Core.Models;
using ONEHub.LandingPages.Core.Services.Interfaces;
using ONEHub.Shared.Services.Interfaces;

namespace ONEHub.LandingPages.Core.Services;

public class UnderMaintenanceService(ILogProvider logService, 
    IDomainSettingService memberSiteConfigService,
    IRedisService redisService,
    ICacheKeyService cacheKeyService,
    IHttpClientFactory httpClientFactory) : IUnderMaintenanceService
{
    private const int cacheDurationInSeconds = 60;

    public async Task<ScheduleMaintenance> GetUnderMaintenanceInfoAsync()
    {
        var cacheKey = cacheKeyService.GetFullKey(CacheKey.UnderMaintainInfo);
        var scheduleMaintenance = await redisService.GetAsync<ScheduleMaintenance>(cacheKey);
        scheduleMaintenance ??= await SyncUnderMaintenanceInfoAsync();
        return scheduleMaintenance;
    }

    public async Task<ScheduleMaintenance> SyncUnderMaintenanceInfoAsync()
    {
        var cacheKey = cacheKeyService.GetFullKey(CacheKey.UnderMaintainInfo);
        var scheduleMaintenance = await GetMaintenanceInfoFromApiAsync();
        var slidingExpirationTime = TimeSpan.FromSeconds(cacheDurationInSeconds);
        await redisService.SetAsync(cacheKey, scheduleMaintenance, slidingExpirationTime);
        return scheduleMaintenance;
    }

    private async Task<ScheduleMaintenance> GetMaintenanceInfoFromApiAsync()
    {
        try
        {
            var underMaintenanceLink = memberSiteConfigService.GetUnderMaintenanceLink();
            using var httpClient = httpClientFactory.CreateClient(Settings.UseProxyWithForwardHeaders);
            var request = new HttpRequestMessage(HttpMethod.Get, underMaintenanceLink);
            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var jsonContent = await response.Content.ReadAsStringAsync();
            var scheduleMaintenance = JsonSerializer.Deserialize<ScheduleMaintenance>(jsonContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new DateTimeConverter(), new UnixTimestampConverter() }
            });

            return scheduleMaintenance ?? new ScheduleMaintenance();
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync("Error getting MaintainInfo from API", ex);
            return new ScheduleMaintenance();
        }
    }

    public async Task<bool> GetIsUnderMaintenanceByDomainAsync(string domain)
    {
        var scheduleMaintenance = await GetUnderMaintenanceInfoAsync();

        if (scheduleMaintenance is null || !scheduleMaintenance.Maintain)
        {
            return false;
        }

        if (scheduleMaintenance.ExcludeDomain is null || scheduleMaintenance.ExcludeDomain.Contains(domain))
        {
            return false;
        }

        var nowUtcSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var isUnderMaintenance = nowUtcSeconds >= scheduleMaintenance.UTCTimeStart && nowUtcSeconds <= scheduleMaintenance.UTCTimeEnd;
        return isUnderMaintenance;
    }
}
