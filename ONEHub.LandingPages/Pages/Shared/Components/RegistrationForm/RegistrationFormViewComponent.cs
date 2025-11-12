using Microsoft.AspNetCore.Mvc;

namespace ONEHub.LandingPages.Pages.Shared.Components.RegisterForm;

public class RegistrationFormViewComponent : ViewComponent
{
    public IViewComponentResult Invoke(LandingPageModel model)
    {
        return View("RegistrationForm", model.RegisterForm);
    }
}
