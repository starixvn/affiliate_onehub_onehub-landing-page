namespace ONEHub.LandingPages.Core.Models;

public class RecaptchaInfo
{
    public RecaptchaData Data { get; set; } = new();
    public string TraceId { get; set; } = string.Empty;
    public string ErrorCodePrefix { get; set; } = string.Empty;
    public int ErrorCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public string RawErrorCode { get; set; } = string.Empty;
    public string RawMessage { get; set; } = string.Empty;

    public bool IsTurnstileCaptchaEnabled 
    { 
        get {
            var isEnabled = Data?.Type == 2 && !string.IsNullOrWhiteSpace(Data.SiteKey);
            return isEnabled;
        } 
    }
}

public class RecaptchaData
{
    public int Type { get; set; }
    public string Country { get; set; } = string.Empty;
    public string SiteKey { get; set; } = string.Empty;
}

