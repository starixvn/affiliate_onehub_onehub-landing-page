using Microsoft.AspNetCore.Mvc;

namespace ONEHub.LandingPages.Pages.Shared.Components.ContactUs;

public class ContactUsViewComponent: ViewComponent
{
    public IViewComponentResult Invoke(LandingPageModel model)
    {
        var module = model.LandingPage!.CurrentModules?.FirstOrDefault();
        var mediaLink = module!.GetFullMediaLink(model.MediaRootDomain);
        var redirectLink = module?.ExtraInfo ?? string.Empty;

        return View("ContactUs", (redirectLink, mediaLink));
    }
}
