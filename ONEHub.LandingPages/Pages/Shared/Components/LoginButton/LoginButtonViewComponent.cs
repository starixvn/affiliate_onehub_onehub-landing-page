using ONEHub.LandingPages.Core.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ONEHub.LandingPages.Pages.Shared.Components.LoginButton;

public class LoginButtonViewComponent(IDomainSettingService domainSettingService) : ViewComponent
{
    public IViewComponentResult Invoke(LandingPageModel model)
    {
        var module = model.LandingPage!.CurrentModules?.FirstOrDefault();
        var loginPath = module?.ExtraInfo ?? "login";
        var loginLink = domainSettingService.GetMemberSiteLinkWithPath(HttpContext.Request, model.LanguageCode, loginPath);
        var mediaLink = module!.GetFullMediaLink(model.MediaRootDomain);

        return View("LoginButton", (loginLink, mediaLink));
    }
}
