using Microsoft.AspNetCore.Http;

namespace ONEHub.LandingPages.Core.Services.Interfaces;

public interface IDomainSettingService
{
    string GetMainMemberSiteHost();

    string GetAPIHost();

    string GetCurrentMemberSiteHost(HttpRequest request);

    string GetCurrentMemberSiteHost(HttpRequest request, string langCode);

    string GetMemberSiteAfterSignUpSuccess(HttpRequest request, string langCode);

    string GetCurrentMemberSiteJoin(HttpRequest request, string langCode);

    string GetMemberSiteLinkWithPath(HttpRequest request, string langCode, string path);

    string GetApiLink(string path);

    string GetRootDomain(HttpRequest request);

    string GetCurrentLandingPageDomain(HttpRequest request);

    string GetClientIpAddress(HttpContext httpContext);

    string GetUnderMaintenanceLink();

    bool GetEnableCheckUnderMaintenance();

    string GetTermsConditionsLink(string langCode);

    string GetMediaRootDomain();
}

