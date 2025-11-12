using System.ComponentModel.DataAnnotations;
using ONEHub.LandingPages.Core.Constants;
using ONEHub.LandingPages.Core.Extensions;
using ONEHub.LandingPages.Core.Resources;
using Microsoft.AspNetCore.Mvc;

namespace ONEHub.LandingPages.Core.Models;

public class RegisterForm
{
    [Required(ErrorMessageResourceName = "Validation_UsernameRequired", ErrorMessageResourceType = typeof(UI))]
    [StringLength(18, MinimumLength = 6, ErrorMessageResourceName = "Validation_UsernameLengthRequired", ErrorMessageResourceType = typeof(UI))]
    [Remote(action: "CheckExistsUsername", controller: "SignUp", HttpMethod = "POST",
        AdditionalFields = nameof(UserLang),
        ErrorMessageResourceName = "Validation_UsernameNoLongerAvailable", ErrorMessageResourceType = typeof(UI))]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessageResourceName = "Validation_PasswordRequired", ErrorMessageResourceType = typeof(UI))]
    [StringLength(15, MinimumLength = 6, ErrorMessageResourceName = "Validation_PasswordLengthRequired", ErrorMessageResourceType = typeof(UI))]
    [DataType(DataType.Password)]
    [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d).{6,}$",
        ErrorMessageResourceName = "Validation_PasswordLengthRequired", ErrorMessageResourceType = typeof(UI))]
    public string UserPwd { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    [EmailAddress(ErrorMessageResourceName = "Validation_EmailFormat", ErrorMessageResourceType = typeof(UI))]
    [Remote(action: "CheckExistsEmail", controller: "SignUp", HttpMethod = "POST",
        AdditionalFields = nameof(UserLang), ErrorMessageResourceName = "Validation_EmailAlreadyExists", ErrorMessageResourceType = typeof(UI))]
    public string? Email { get; set; }

    [Required(ErrorMessageResourceName = "Validation_PhoneRequired", ErrorMessageResourceType = typeof(UI))]
    [PhoneNumberByCountry("CountryCode", ErrorMessageResourceName = "Validation_PhoneInvalidForCountry", ErrorMessageResourceType = typeof(UI))]
    public string PhoneNo { get; set; } = string.Empty;

    [Required]
    public string CountryCode { get; set; } = string.Empty;

    public string AreaCode { get; set; } = string.Empty;
    public int CurrencyId { get; set; }
    public string UserLang { get; set; } = string.Empty;
    public int CaptchaType { get; set; }

    [Required(ErrorMessageResourceName = "Validation_Capcha", ErrorMessageResourceType = typeof(UI))]
    public string ReCaptchaToken { get; set; } = string.Empty;
    public string AffClickId { get; set; } = string.Empty;
    public string AffMediaLinkId { get; set; } = string.Empty;
    public string SignUpUrl { get; set; } = string.Empty;
    public string ReferralUrl { get; set; } = string.Empty;

    [Remote(action: "CheckAffiliate", controller: "SignUp", HttpMethod = "POST", 
        AdditionalFields = nameof(UserLang),
        ErrorMessageResourceName = "Validation_AffiliateNotFound", ErrorMessageResourceType = typeof(UI))]
    public string? AffCode { get; set; }

    public string UserAgent { get; set; } = string.Empty;

    public string IpAddress { get; set; } = string.Empty;

    public string ApiUrl { get; set; } = string.Empty;

    public SignUpFormConfig? SignUpFormConfig { get; set; }

    public string TermsConditionsUrl { get; set; } = string.Empty;

    public bool IsTurnstileCaptchaEnabled { get; set; }

    public string TurnstileSiteKey { get; set; } = string.Empty;

    public string? RedirectUrl { get; set; } = string.Empty;

    public string? IsSuccessful { get; set; } = "false";

    public bool IsIndiaMarket
    { 
        get
        {
            return string.Equals(CountryCode, LandingPageConstants.IndiaContryCode, StringComparison.OrdinalIgnoreCase)
                && string.Equals(UserLang, LandingPageConstants.DefaultLanguageCode, StringComparison.OrdinalIgnoreCase);
        }
    }
}
