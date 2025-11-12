namespace ONEHub.LandingPages.Core.Models;

public class LandingPage
{
    public int PageId { get; set; }

    public string PageCode { get; set; } = string.Empty;

    public string PageName { get; set; } = string.Empty;

    public int DialCode { get; set; }

    public int CampaignId { get; set; }

    public int CurrencyId { get; set; }

    public string TargetCountryCode { get; set; } = string.Empty;

    public string TargetLanguageCode { get; set; } = string.Empty;

    public string MarketId { get; set; } = string.Empty;

    public string DealIds { get; set; } = string.Empty;

    public int StatusId { get; set; }

    public int CaptchaType { get; set; }

    public bool IsTurnstileCaptchaEnabled { get; set; }

    public string TurnstileSiteKey { get; set; } = string.Empty;

    public IEnumerable<LandingPageModule>? Modules { get; set; }

    public string RowVer { get; set; } = string.Empty;

    public IEnumerable<LandingPageModule>? CurrentModules { get; set; }


}
