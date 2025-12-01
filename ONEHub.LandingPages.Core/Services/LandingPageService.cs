using ONEHub.LandingPages.Core.Criteria;
using ONEHub.LandingPages.Core.Models;
using ONEHub.LandingPages.Core.Services.Interfaces;
using Fanex.Data.Repository;
using ONEHub.Shared.Services.Interfaces;

namespace ONEHub.LandingPages.Core.Services;

public class LandingPageService(IDynamicRepository dynamicRepository, IRedisService redisService, ICacheKeyService cacheKeyService) : ILandingPageService
{
    private const int cacheDurationInSeconds = 86400;

    public async Task<LandingPage?> GetLandingPage(string pageCode, bool? refresh, bool? isPreview, int? pageId = null)
    {
        var isPreviewValue = (isPreview.HasValue && isPreview.Value);
        var pageIdKey = pageId is null ? string.Empty : pageId.ToString();
        var cacheKey = isPreviewValue
                ? cacheKeyService.GetFullKey(CacheKey.LandingPagePreview, pageCode, pageIdKey)
                : cacheKeyService.GetFullKey(CacheKey.LandingPage, pageCode);
        LandingPage? landingPage = null;
        if (!refresh.HasValue || !refresh.Value)
        {
            landingPage = await redisService.GetAsync<LandingPage>(cacheKey);
        }
        
        if (landingPage is null)
        {
            landingPage = await GetLandingPageFromDatabase(pageCode, isPreviewValue, pageId);
            var slidingExpirationTime = TimeSpan.FromSeconds(cacheDurationInSeconds);
            await redisService.SetAsync(cacheKey, landingPage, slidingExpirationTime);
        }

        if (landingPage is not null && landingPage.StatusId == (int)PageStatus.Inactive)
        {
            return default;
        }

        return landingPage!;
    }

    public async Task<LandingPage> GetLandingPageFromDatabase(string pageCode, bool isPreview, int? pageId = null)
    {
        var criteria = new GetLandingPageCriteria
        {
            PageCode = pageCode,
            IsPreview = isPreview,
            PageId = pageId
        };

        var results = await dynamicRepository.FetchMultipleAsync<LandingPage, LandingPageModule>(criteria);
        var landingPage = results.Item1.FirstOrDefault();
        if (landingPage != null)
        {
            landingPage.Modules = results.Item2;
        }

        return landingPage!;
    }

    public async Task SyncAllLandingPageToCache()
    {
        var cacheKeyAll = cacheKeyService.GetFullKey(CacheKey.AllLandingPageVersion);
        var landingPages = await GetAllLandingPages(false);
        var landingPageVersions = landingPages.ToDictionary(t => t.PageCode, t => t.RowVer); 
        var oldLandingPageVersions = await redisService.GetAsync<Dictionary<string, string>>(cacheKeyAll);
        var changedLandingPages = new List<LandingPage>();

        if (oldLandingPageVersions == null)
        {
            changedLandingPages.AddRange(landingPages);
        }
        else
        {
            foreach (var landingPage in landingPages)
            {
                if (!oldLandingPageVersions.TryGetValue(landingPage.PageCode, out var oldVersion) || oldVersion != landingPage.RowVer)
                {
                    changedLandingPages.Add(landingPage);
                }
            }
        }

        if (changedLandingPages.Any())
        {
            var slidingExpirationTime = TimeSpan.FromSeconds(cacheDurationInSeconds);
            await redisService.SetAsync(cacheKeyAll, landingPageVersions, slidingExpirationTime);

            foreach (var landingPage in changedLandingPages)
            {
                var cacheKey = cacheKeyService.GetFullKey(CacheKey.LandingPage, landingPage.PageCode);
                await redisService.SetAsync(cacheKey, landingPage, slidingExpirationTime);
            }
        }
    }

    public async Task<IEnumerable<LandingPage>> GetAllLandingPages(bool isPreview)
    {
        var criteria = new GetAllLandingPageCriteria
        {
            IsPreview = isPreview
        };

        var results = await dynamicRepository.FetchMultipleAsync<LandingPage, LandingPageModule>(criteria);
        var landingPages = results.Item1;
        if (landingPages != null)
        {
            foreach(var landingPage in landingPages)
            {
                landingPage.Modules = results.Item2.Where(t=> t.PageId == landingPage.PageId);
            }
            
        }

        return landingPages!;
    }
}
