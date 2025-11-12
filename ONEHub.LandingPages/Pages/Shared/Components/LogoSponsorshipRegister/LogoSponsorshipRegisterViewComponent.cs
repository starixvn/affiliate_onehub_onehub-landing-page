using Microsoft.AspNetCore.Mvc;

namespace ONEHub.LandingPages.Pages.Shared.Components.LogoSponsorshipRegister;

public class LogoSponsorshipRegisterViewComponent : ViewComponent
{
    public IViewComponentResult Invoke(LandingPageModel model)
    {
        var module = model.LandingPage!.CurrentModules?.FirstOrDefault();
        var mediaLink = module!.GetFullMediaLink(model.MediaRootDomain);
        return View("LogoSponsorshipRegister", mediaLink);
    }
}
