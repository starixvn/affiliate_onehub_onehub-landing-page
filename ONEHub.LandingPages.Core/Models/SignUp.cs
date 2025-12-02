namespace ONEHub.LandingPages.Core.Models;

public class SignUp
{
    public string Username { get; set; } = string.Empty;
    public string UserPwd { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string PhoneNo { get; set; } = string.Empty;
    public string AreaCode { get; set; } = string.Empty;
    public int CurrencyId { get; set; }
    public string UserLang { get; set; } = string.Empty;
    public int CaptchaType { get; set; }
    public string ReCaptchaToken { get; set; } = string.Empty;
    public string? AffCode { get; set; }
    public string? IdCode { get; set; }
    public string IdCodeClickId { get; set; } = string.Empty;
    public int IdCodeLinkId { get; set; }
    public string AffClickId { get; set; } = string.Empty;
    public string ReferralUrl { get; set; } = string.Empty;
}
