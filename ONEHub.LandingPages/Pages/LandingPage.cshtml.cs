using System.Globalization;
using ONEHub.LandingPages.Core;
using ONEHub.LandingPages.Core.Constants;
using ONEHub.LandingPages.Core.Models;
using ONEHub.LandingPages.Core.Services;
using ONEHub.LandingPages.Core.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using PhoneNumbers;
using ONEHub.Shared.Services.Interfaces;

namespace ONEHub.LandingPages.Pages;

/// <summary>
/// Landing page model for handling user registration and page display
/// </summary>
public class LandingPageModel(
    ILandingPageService landingPageService,
    ISignUpService signUpService,
    IDomainSettingService domainSettingService,
    ILogProvider logService) : PageModel
{
    #region Properties

    [BindProperty(SupportsGet = true)]
    public required string PageCode { get; set; }

    [BindProperty(SupportsGet = true)]
    public required string LanguageCode { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? Version { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? ClickId { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? OClickId { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? OLinkId { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? AffCode { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? IdCode { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? FormCode { get; set; } = LandingPageConstants.DefaultFormCode;

    [BindProperty(SupportsGet = true)]
    public bool? IsPreView { get; set; } = false;

    [BindProperty(SupportsGet = true)]
    public bool? Refresh { get; set; } = false;

    [BindProperty(SupportsGet = true)]
    public int? PageId { get; set; }

    [BindProperty]
    public RegisterForm RegisterForm { get; set; } = new();

    public LandingPage? LandingPage { get; set; }

    public string MediaRootDomain 
    { 
        get 
        {
            return domainSettingService.GetMediaRootDomain();
        }
    }

    #endregion

    #region Public Methods

    /// <summary>
    /// Handles GET requests for the landing page
    /// </summary>
    /// <returns>Page result or redirect</returns>
    public async Task<IActionResult> OnGetAsync()
    {
        try
        {
            ValidateRequiredParameters();
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync(ex);
        }

        return await ProcessFormDataAsync();
    }

    /// <summary>
    /// Handles POST requests for form submission
    /// </summary>
    /// <returns>Page result or redirect</returns>
    public async Task<IActionResult> OnPostAsync()
    {
        try
        {
            var errorMessage = string.Empty;
            if (ModelState.IsValid && RegisterForm != null)
            {
                var result = await ProcessRegistrationAsync();
                if (result.Success)
                {
                    HandleSuccessfulRegistrationAsync(result);
                    return await ProcessFormDataAsync();
                }
                else
                {
                    errorMessage = result.ErrorMessage;
                }
            }
            else
            {
                errorMessage = GetModelStateErrors();
            }

            if (!string.IsNullOrWhiteSpace(errorMessage))
            {
                ModelState.AddModelError(string.Empty, errorMessage);
            }
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync(ex);
            ModelState.AddModelError(string.Empty, LandingPageConstants.ProcessingError);
        }

        return await ProcessFormDataAsync();
    }

    #endregion

    #region Private Methods

    /// <summary>
    /// Validates required parameters
    /// </summary>
    /// <exception cref="ArgumentException">Thrown when required parameters are missing</exception>
    private void ValidateRequiredParameters()
    {
        if (!ValidationService.ValidateRequiredString(PageCode, nameof(PageCode)))
        {
            throw new ArgumentException(ValidationService.GetRequiredParameterErrorMessage(nameof(PageCode)));
        }

        if (!ValidationService.ValidateRequiredString(LanguageCode, nameof(LanguageCode)))
        {
            throw new ArgumentException(ValidationService.GetRequiredParameterErrorMessage(nameof(LanguageCode)));
        }
    }


    /// <summary>
    /// Configures form data by loading landing page information
    /// </summary>
    private async Task<IActionResult> ProcessFormDataAsync()
    {
        try
        {
            LandingPage = await LoadPageDataAsync(PageCode, Refresh, IsPreView, PageId);

            var redirectResult = await HandleRedirectsAsync(LandingPage);
            if (redirectResult is not null)
            {
                return redirectResult;
            }
            else
            {
                ConfigureRegisterForm(LandingPage!);
                return Page();
            }
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync(ex);
            return Page();
        }

    }

    /// <summary>
    /// Configures the register form with landing page data
    /// </summary>
    /// <param name="landingPage">Landing page data</param>
    private void ConfigureRegisterForm(LandingPage landingPage)
    {
        var currentCulture = CultureInfo.CurrentUICulture.Name;
        var languageCode = CultureMappingConstants.GetLanguageFromCulture(currentCulture);
        
        RegisterForm.UserLang = languageCode;
        RegisterForm.CaptchaType = landingPage.CaptchaType;
        RegisterForm.AreaCode = $"+{landingPage.DialCode}";
        RegisterForm.CountryCode = landingPage.TargetCountryCode;
        RegisterForm.CurrencyId = landingPage.CurrencyId;
        RegisterForm.ClickId = ClickId ?? string.Empty;
        RegisterForm.IdCode = IdCode ?? string.Empty;
        RegisterForm.AffCode = RegisterForm.HasIdCode ? RegisterForm.IdCode : (AffCode ?? string.Empty);
        RegisterForm.OClickId = OClickId ?? string.Empty;
        RegisterForm.OLinkId = OLinkId ?? string.Empty;

        RegisterForm.TermsConditionsUrl = domainSettingService.GetTermsConditionsLink(languageCode);
        RegisterForm.IsTurnstileCaptchaEnabled = landingPage.IsTurnstileCaptchaEnabled;
        RegisterForm.TurnstileSiteKey = landingPage.TurnstileSiteKey;
        
        var form = landingPage.Modules!.FirstOrDefault(t => t.ModuleId == (int)UiModule.RegistrationForm);
        var formCode = form?.MediaCode ?? FormCode;
        if (Request.Query.ContainsKey("FormCode"))
        {
            formCode = Request.Query["FormCode"].ToString();
        }

        RegisterForm.SignUpFormConfig = SignUpFormConfigs.SupportSignUpForms
            .FirstOrDefault(t => t.FormCode == formCode);
    }

    /// <summary>
    /// Loads landing page data from service
    /// </summary>
    /// <param name="pageCode">Page code</param>
    /// <returns>Landing page data or null if not found</returns>
    private async Task<LandingPage?> LoadPageDataAsync(string pageCode, bool? refresh, bool? isPreview, int? pageId)
    {
        var landingPage = await landingPageService.GetLandingPage(pageCode, refresh, isPreview, pageId);
        if (landingPage is null)
        {
            return null;
        }

        await ConfigureCaptchaInfoAsync(landingPage);
        ConfigurePhoneInfo(landingPage);

        return landingPage;
    }

    /// <summary>
    /// Configures captcha information for the landing page
    /// </summary>
    /// <param name="landingPage">Landing page to configure</param>
    private async Task ConfigureCaptchaInfoAsync(LandingPage landingPage)
    {
        var currentCulture = CultureInfo.CurrentUICulture.Name;
        var languageCode = CultureMappingConstants.GetLanguageFromCulture(currentCulture);

        var currentDomain = HttpContext.Request.Host.ToString();
        var captchaInfo = await signUpService.GetRecaptchaInfoAsync(languageCode, currentDomain);
        landingPage.CaptchaType = captchaInfo.IsTurnstileCaptchaEnabled 
            ? LandingPageConstants.TurnstileCaptchaType 
            : LandingPageConstants.NumberCaptchaType;
        landingPage.IsTurnstileCaptchaEnabled = captchaInfo.IsTurnstileCaptchaEnabled;
        landingPage.TurnstileSiteKey = captchaInfo.Data?.SiteKey ?? string.Empty;
    }

    /// <summary>
    /// Configures phone information for the landing page
    /// </summary>
    /// <param name="landingPage">Landing page to configure</param>
    private static void ConfigurePhoneInfo(LandingPage landingPage)
    {
        var phoneUtil = PhoneNumberUtil.GetInstance();
        landingPage.DialCode = phoneUtil.GetCountryCodeForRegion(landingPage.TargetCountryCode);
    }

    /// <summary>
    /// Handles redirects based on landing page data
    /// </summary>
    /// <param name="landingPage">Landing page data</param>
    /// <returns>Redirect result or null if no redirect needed</returns>
    private Task<IActionResult?> HandleRedirectsAsync(LandingPage? landingPage)
    {
        var queryString = Request.QueryString.HasValue ? Request.QueryString.Value : string.Empty;

        if (landingPage is null)
        {
            var redirectLink = domainSettingService.GetCurrentMemberSiteJoin(HttpContext.Request, LanguageCode);
            return Task.FromResult<IActionResult?>(Redirect($"{redirectLink}{queryString}"));
        }

        var languageCode = CultureMappingConstants.IsLanguageSupported(landingPage.TargetLanguageCode)
                   ? landingPage.TargetLanguageCode
                   : CultureMappingConstants.DefaultLanguage;

        if (!string.Equals(LanguageCode, languageCode, StringComparison.OrdinalIgnoreCase))
        {
            var correctUrl = GetCorrectLanguageLink(languageCode);
            return Task.FromResult<IActionResult?>(RedirectPermanent(correctUrl));
        }

        return Task.FromResult<IActionResult?>(null);
    }

    /// <summary>
    /// Processes user registration
    /// </summary>
    /// <returns>Registration result</returns>
    private async Task<RegistrationResult> ProcessRegistrationAsync()
    {
        if (RegisterForm is null)
        {
            return new RegistrationResult(false, LandingPageConstants.RegistrationFormNotAvailable);
        }

        var registerData = ProcessDataSubmitForm(RegisterForm);
        var result = await signUpService.SignUpAsync(registerData);

        if (result.ErrorCode == 0)
        {
            return new RegistrationResult(true, string.Empty, result);
        }

        string errorMessage = GetErrorMessage(result);
        return new RegistrationResult(false, errorMessage);
    }

    private static string GetErrorMessage(SignUpResponse result)
    {
        string errorMessage;
        if (string.IsNullOrEmpty(result.Message))
        {
            errorMessage = $"[{result.ErrorCode}] - {LandingPageConstants.ProcessingError}";
        }
        else if (result.Message.Contains(result.ErrorCode.ToString()))
        {
            errorMessage = result.Message;
        }
        else
        {
            errorMessage = $"[{result.ErrorCode}] - {result.Message}";
        }

        return errorMessage;
    }

    /// <summary>
    /// Process the registration form with request data
    /// </summary>
    private RegisterForm ProcessDataSubmitForm(RegisterForm registerForm)
    {
        registerForm.UserPwd = registerForm.Password;
        registerForm.ClickId = ClickId ?? string.Empty;
        registerForm.OClickId = OClickId ?? string.Empty;
        registerForm.OLinkId = OLinkId ?? string.Empty;
        registerForm.AffCode = registerForm.HasIdCode ? null : registerForm.AffCode;
        registerForm.ReferralUrl = GetReferralHeader();
        registerForm.UserAgent = GetRequestHeader(LandingPageConstants.UserAgentHeader);
        registerForm.SignUpUrl = domainSettingService.GetCurrentLandingPageDomain(HttpContext.Request);
        registerForm.IpAddress = domainSettingService.GetClientIpAddress(HttpContext);
        return registerForm;
    }

    private string GetReferralHeader()
    {
        var refererUrl = string.Empty;
        var referer = GetRequestHeader(LandingPageConstants.RefererHeader);
        if (!string.IsNullOrEmpty(referer))
        {
            try
            {
                var uri = new Uri(referer);
                var cleanUri = uri.GetLeftPart(UriPartial.Path);
                refererUrl = cleanUri;
            }
            catch
            {
                refererUrl = referer;
            }
        }

        return refererUrl;
    }

    private void HandleSuccessfulRegistrationAsync(RegistrationResult result)
    {
        AppendSetCookie(result.Response!);
        var redirectLink = domainSettingService.GetMemberSiteAfterSignUpSuccess(HttpContext.Request, LanguageCode);
        RegisterForm.IsSuccessful = "true";
        RegisterForm.RedirectUrl = redirectLink;
    }

    /// <summary>
    /// Appends cookies from sign-up response to HTTP response
    /// </summary>
    /// <param name="result">Sign-up response containing cookies</param>
    private void AppendSetCookie(SignUpResponse result)
    {
        if (result.Cookies?.Any() == true)
        {
            foreach (var cookie in result.Cookies)
            {
                Response.Headers.Append(LandingPageConstants.SetCookieHeader, cookie);
            }
        }
    }

    /// <summary>
    /// Gets a request header value
    /// </summary>
    /// <param name="headerName">Header name</param>
    /// <returns>Header value or empty string</returns>
    private string GetRequestHeader(string headerName)
    {
        return HttpContext.Request.Headers.TryGetValue(headerName, out var headerValue) 
            ? headerValue.ToString() 
            : string.Empty;
    }

    /// <summary>
    /// Gets the correct language link for redirects
    /// </summary>
    /// <param name="targetLanguageCode">Target language code</param>
    /// <returns>Correct language URL</returns>
    private string GetCorrectLanguageLink(string targetLanguageCode)
    {
        var routeValues = new Dictionary<string, object?>(RouteData.Values, StringComparer.OrdinalIgnoreCase)
        {
            ["languageCode"] = targetLanguageCode
        };

        var queryString = Request.QueryString.HasValue ? Request.QueryString.Value : string.Empty;
        var newPath = Url.Page(null, null, routeValues, LandingPageConstants.HttpsScheme);

        return $"{newPath}{queryString}";
    }

    /// <summary>
    /// Gets model state validation errors as a single string
    /// </summary>
    /// <returns>Combined error message</returns>
    private string GetModelStateErrors()
    {
        var errors = ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .Where(e => !string.IsNullOrEmpty(e));

        return string.Join("; ", errors);
    }

    #endregion

    #region Helper Classes

    /// <summary>
    /// Result of registration processing
    /// </summary>
    /// <param name="Success">Whether registration was successful</param>
    /// <param name="ErrorMessage">Error message if registration failed</param>
    /// <param name="Response">Sign-up response if successful</param>
    private sealed record RegistrationResult(bool Success, string ErrorMessage, SignUpResponse? Response = null);

    #endregion
}