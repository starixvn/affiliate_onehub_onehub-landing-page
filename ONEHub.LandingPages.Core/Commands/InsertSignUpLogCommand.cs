using ONEHub.Shared.Commands;

namespace ONEHub.LandingPages.Core.Commands;

public class InsertSignUpLogCommand: BaseNonQueryCommand
{
    public string Username { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string PhoneNo { get; set; } = string.Empty;
    public string AreaCode { get; set; } = string.Empty;
    public int CurrencyId { get; set; }
    public string UserLang { get; set; } = string.Empty;
    public int CaptchaType { get; set; }
    public string ReCaptchaToken { get; set; } = string.Empty;
    public string? AffCode { get; set; }
    public string AffClickId { get; set; } = string.Empty;
    public string? IdCode { get; set; }
    public string OClickId { get; set; } = string.Empty;
    public int? OLinkId { get; set; }
    public string ReferralUrl { get; set; } = string.Empty;
    public string IP { get; set; } = string.Empty;
    public string ExtData { get; set; } = string.Empty;
    public long Duration { get; set; }
    public string Status { get; set; } = string.Empty;
    public string APITraceId { get; set; } = string.Empty;
    public string APIErrorCode { get; set; } = string.Empty;
    public string APIMessage { get; set; } = string.Empty;
    public string ApiUrl { get; set; } = string.Empty;
    public string SignUpUrl { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public override string GetSettingKey() => "OH_SignUp";

    public override bool IsValid() => true;
}
