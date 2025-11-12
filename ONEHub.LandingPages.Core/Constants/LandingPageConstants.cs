namespace ONEHub.LandingPages.Core.Constants;

/// <summary>
/// Constants for Landing Page functionality
/// </summary>
public static class LandingPageConstants
{
    // Tracking parameter keys
    public const string ClickIdKey = "ClickId";
    public const string AffCodeKey = "AffCode";
    
    // HTTP headers
    public const string RefererHeader = "Referer";
    public const string UserAgentHeader = "User-Agent";
    public const string SetCookieHeader = "Set-Cookie";
    public const string XForwardedForHeader = "X-Forwarded-For";
    
    // Captcha types
    public const int TurnstileCaptchaType = 2;
    public const int NumberCaptchaType = 0;
    
    // Domain validation
    public const int MinimumDomainParts = 2;
    
    // Default values
    public const string DefaultFormCode = "F1";
    public const string DefaultLanguageCode = "en";
    public const string DefaultPath = "join";
    public const string IndiaContryCode = "IN";

    // URL schemes
    public const string HttpsScheme = "https";
    
    // Ports
    public const int HttpsPort = 443;
    public const int HttpPort = 80;
    
    // Error messages
    public const string RegistrationFormNotAvailable = "Registration form is not available";
    public const string ProcessingError = "An error occurred while processing your request. Please try again.";
    public const string LandingPageLoadError = "Error occurred while loading landing page";
    public const string FormSubmissionError = "Error occurred during form submission";
}
