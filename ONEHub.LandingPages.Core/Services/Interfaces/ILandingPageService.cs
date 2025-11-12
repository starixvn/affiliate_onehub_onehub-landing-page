using ONEHub.LandingPages.Core.Models;

namespace ONEHub.LandingPages.Core.Services.Interfaces;

public interface ILandingPageService
{
    Task<LandingPage?> GetLandingPage(string pageCode, bool? refresh, bool? isPreview, int? pageId = null);

    Task<IEnumerable<LandingPage>> GetAllLandingPages(bool isPreview);

    Task SyncAllLandingPageToCache();
}
