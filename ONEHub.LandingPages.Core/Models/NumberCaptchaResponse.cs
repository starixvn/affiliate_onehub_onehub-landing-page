using ONEHub.LandingPages.Core.Models;

namespace ONEHub.LandingPages.Core.Services;

public class NumberCaptchaResponse : BaseResponse
{
    public NumberCaptchaData? Data { get; set; }
}

public class NumberCaptchaData
{
    public int Seconds { get; set; }
    public string Picture { get; set; } = string.Empty;
}

public class NumberCaptchaExpire
{
    public NumberCaptchaExpire(NumberCaptchaData numberCaptchaData)
    {
        NumberCaptchaData = numberCaptchaData;
        ExpireTime = DateTimeOffset.Now.AddSeconds(numberCaptchaData.Seconds);
    }

    public NumberCaptchaData NumberCaptchaData { get; set; }

    public DateTimeOffset ExpireTime { get; set; }
}