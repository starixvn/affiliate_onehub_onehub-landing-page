namespace ONEHub.LandingPages.Consumer;

using ONEHub.LandingPages.Core.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ONEHub.Shared.Extensions;

public class WhoamiController : Controller
{
    [Route("healthz")]
    [AllowAnonymous]
    public IActionResult Whoami()
    {
        return Content(WhoamiHelper.GetContent(HttpContext));
    }
}