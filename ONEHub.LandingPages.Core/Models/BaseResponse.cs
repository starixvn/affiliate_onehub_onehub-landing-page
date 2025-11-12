namespace ONEHub.LandingPages.Core.Models;

public class BaseResponse
{
    public string TraceId { get; set; } = string.Empty;
    public string ErrorCodePrefix { get; set; } = string.Empty;
    public int ErrorCode { get; set; } 
    public string Message { get; set; } = string.Empty;
    public string RawErrorCode { get; set; } = string.Empty;
    public string RawMessage { get; set; } = string.Empty;
}
