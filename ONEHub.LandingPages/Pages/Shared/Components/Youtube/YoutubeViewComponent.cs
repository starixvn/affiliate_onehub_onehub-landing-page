using Microsoft.AspNetCore.Mvc;

namespace ONEHub.LandingPages.Pages.Shared.Components.Youtube;

public class YoutubeViewComponent : ViewComponent
{
    public IViewComponentResult Invoke(LandingPageModel model)
    {
        var youtubeLink = model.LandingPage?.CurrentModules?.FirstOrDefault()?.ExtraInfo ?? string.Empty;
        return View("Youtube", youtubeLink);
    }
}
