using System.Globalization;
using ONEHub.LandingPages.Core.Constants;
using ONEHub.LandingPages.Core.Resources;

namespace ONEHub.LandingPages.Core.Services;

/// <summary>
/// Service for handling culture settings in landing pages
/// </summary>
public static class LandingPageCultureService
{
    /// <summary>
    /// Sets culture based on language code
    /// </summary>
    /// <param name="languageCode">Language code (e.g., "vn", "th", "cn")</param>
    public static void SetCulture(string languageCode)
    {
        if (string.IsNullOrWhiteSpace(languageCode))
        {
            SetDefaultCulture();
            return;
        }

        var cultureName = CultureMappingConstants.GetCultureName(languageCode);

        SetCultureInternal(cultureName);
    }

    /// <summary>
    /// Sets the default culture
    /// </summary>
    public static void SetDefaultCulture()
    {
        SetCultureInternal(CultureMappingConstants.DefaultCulture);
    }

    private static void SetCultureInternal(string cultureName)
    {
        try
        {
            var cultureInfo = new CultureInfo(cultureName);
            
            // Set for UI resources
            UI.Culture = cultureInfo;
            
            // Set for System.Globalization (thread-local, safe for concurrent requests)
            CultureInfo.CurrentUICulture = cultureInfo;
            CultureInfo.CurrentCulture = cultureInfo;
        }
        catch (CultureNotFoundException)
        {
            // Fallback to default culture if invalid culture is provided
            var defaultCulture = new CultureInfo(CultureMappingConstants.DefaultCulture);
            UI.Culture = defaultCulture;
            CultureInfo.CurrentUICulture = defaultCulture;
            CultureInfo.CurrentCulture = defaultCulture;
        }
    }
}
