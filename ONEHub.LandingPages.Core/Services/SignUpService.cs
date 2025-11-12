using System.Diagnostics;
using System.Text.Json;
using ONEHub.LandingPages.Core.Models;
using ONEHub.LandingPages.Core.Resources;
using ONEHub.LandingPages.Core.Services.Interfaces;
using ONEHub.Shared.Services.Interfaces;

namespace ONEHub.LandingPages.Core.Services;

public class SignUpService(ILogProvider logService, 
    IDomainSettingService memberSiteConfigService,
    ITrackingSignUpService trackingSignUpService,
    IHttpService httpService,
    IRedisService redisService,
    ICacheKeyService cacheKeyService) : ISignUpService
{
    private const int cacheDurationInSeconds = 86400;
    private const int cacheDurationNumberCaptCha = 300;

    public async Task<RecaptchaInfo> GetRecaptchaInfoAsync(string langCode, string domain)
    {
        var cacheKey = cacheKeyService.GetFullKey(CacheKey.RecaptchaInfo, langCode, domain);
        var recaptchaInfo = await redisService.GetAsync<RecaptchaInfo>(cacheKey);
        if (recaptchaInfo is null)
        {
            recaptchaInfo = await GetRecaptchaInfoFromAPIAsync(langCode);
            var slidingExpirationTime = TimeSpan.FromSeconds(cacheDurationInSeconds);
            await redisService.SetAsync(cacheKey, recaptchaInfo, slidingExpirationTime);
        }

        return recaptchaInfo;
    }

    private async Task<RecaptchaInfo> GetRecaptchaInfoFromAPIAsync(string langCode)
    {
        try
        {
            var requestUrl = $"{memberSiteConfigService.GetAPIHost()}{ApiPath.GetRecaptchaInfo}/{langCode}";
            var (result, _) = await httpService.PostAsync<RecaptchaInfo>(requestUrl, string.Empty);
            return result ?? new RecaptchaInfo();
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync("Error getting RecaptchaInfo", ex);
            return new RecaptchaInfo();
        }
    }

    public async Task<NumberCaptchaResponse> GetNumberCaptchaAsync(string langCode)
    {
        try
        {
            const string action = "signup";
            var requestUrl = $"{memberSiteConfigService.GetAPIHost()}{ApiPath.GetNumberCaptcha}/{langCode}";
            var bodyContent = JsonSerializer.Serialize(new { action });
            var (result, _) = await httpService.PostAsync<NumberCaptchaResponse>(requestUrl, bodyContent);
            return result ?? new NumberCaptchaResponse
            {
                Data = new NumberCaptchaData()
            };
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync("Error getting NumberCaptcha", ex);
            return new NumberCaptchaResponse
            {
                Data = new NumberCaptchaData()
            };
        }
    }

    public async Task SaveNumberCaptchaToCacheAsync(string clientIpAddress, NumberCaptchaData numberCaptcha)
    {
        var expirationTime = TimeSpan.FromSeconds(cacheDurationNumberCaptCha);
        var numberCaptchaKey = $"{cacheKeyService.GetFullKey(CacheKey.NumberCaptcha)}:{clientIpAddress}";
        var numberCaptChaData = new NumberCaptchaExpire(numberCaptcha);
        await redisService.SetAsync(numberCaptchaKey, numberCaptChaData, expirationTime);
    }

    private async Task<NumberCaptchaExpire> GetNumberCaptchaFromCacheAsync(string clientIpAddress)
    {
        var numberCaptchaKey = $"{cacheKeyService.GetFullKey(CacheKey.NumberCaptcha)}:{clientIpAddress}";
        var captCha = await redisService.GetAsync<NumberCaptchaExpire>(numberCaptchaKey);
        return captCha!;
    }

    public async Task<ExistsEmailResponse> CheckExistsEmailAsync(string email, string langCode)
    {
        try
        {
            var apiHost = memberSiteConfigService.GetAPIHost();
            var requestUrl = $"{apiHost}{ApiPath.ExistsEmail}/{langCode}";
            var bodyContent = JsonSerializer.Serialize(new { email });
            var (result, _) = await httpService.PostAsync<ExistsEmailResponse>(requestUrl, bodyContent); 
            return result ?? new ExistsEmailResponse();
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync("Error checking ExistsEmail", ex);
            return new ExistsEmailResponse();
        }
    }

    public async Task<AffiliateCheckResponse> CheckAffiliateAsync(string affCode, string langCode)
    {
        try
        {
            var apiHost = memberSiteConfigService.GetAPIHost();
            var requestUrl = $"{apiHost}{ApiPath.AffiliateCheck}/{langCode}";
            var bodyContent = JsonSerializer.Serialize(new { affCode });
            var (result, _) = await httpService.PostAsync<AffiliateCheckResponse>(requestUrl, bodyContent);
            return result ?? new AffiliateCheckResponse();
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync("Error checking Affiliate", ex);
            return new AffiliateCheckResponse();
        }
    }

    public async Task<ExistsUserNameResponse> CheckExistsUserNameAsync(string username, string langCode)
    {
        try
        {
            var apiHost = memberSiteConfigService.GetAPIHost();
            var requestUrl = $"{apiHost}{ApiPath.ExistsUserName}/{langCode}";
            var bodyContent = JsonSerializer.Serialize(new { username });
            var (result, _) = await httpService.PostAsync<ExistsUserNameResponse>(requestUrl, bodyContent);
            return result ?? new ExistsUserNameResponse();
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync("Error checking ExistsUserName", ex);
            return new ExistsUserNameResponse();
        }
    }

    public async Task<SignUpResponse> SignUpAsync(RegisterForm registerForm)
    {
        var apiHost = memberSiteConfigService.GetAPIHost();
        registerForm.ApiUrl = $"{apiHost}{ApiPath.SignupV2}/{registerForm.UserLang}";

        var stopwatch = Stopwatch.StartNew();
        var (signUpResponse, signUp) = await ProcessSignUpAPI(registerForm);
        stopwatch.Stop();
        
        var signUpRequest = new SignUpRequest
        {
            SignUpData = signUp,
            SignUpResponeData = signUpResponse,
            IpAddress = registerForm.IpAddress,
            UserAgent = registerForm.UserAgent,
            SignUpUrl = registerForm.SignUpUrl,
            ApiUrl = registerForm.ApiUrl,
            Duration = stopwatch.ElapsedMilliseconds,
        };

        _ = Task.Run(async () =>
        {
            await trackingSignUpService.WriteLogSignUp(signUpRequest);
        });
        
        return signUpResponse;
    }

    private async Task<(SignUpResponse, SignUp)> ProcessSignUpAPI(RegisterForm registerForm)
    {
        SignUpResponse? result;
        var signUpRequest = GetSignUpRequest(registerForm);
        try
        {
            var bodyContent = JsonSerializer.Serialize(signUpRequest);
            var response = new HttpResponseMessage();
            (result, response) = await httpService.PostAsync<SignUpResponse>(registerForm.ApiUrl, bodyContent);
            result ??= GetSignUpErrorResponse();

            if (result.ErrorCode == 0)
            {
                response.Headers.TryGetValues("Set-Cookie", out var cookies);
                result.Cookies = cookies;
            }
            else
            {
                await WriteLogAPIError(result, signUpRequest, registerForm);
            }
        }
        catch (HttpRequestException ex)
        {
            await logService.SentryErrorAsync("Error SignUpAsync", ex);
            result = GetSignUpHttpRequestException(ex);
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync("Error SignUpAsync", ex);
            result =  GetSignUpExceptionException(ex);
        }

        return (result, signUpRequest);
    }

    private async Task WriteLogAPIError(SignUpResponse result, SignUp signUpRequest, RegisterForm registerForm)
    {
        // Sanitize sensitive data before logging
        signUpRequest.UserPwd = string.Empty;
        signUpRequest.ReCaptchaToken = string.Empty;
        
        const int errorFailVerify = 1112;
        if (result.ErrorCode == errorFailVerify)
        {
            var captCha = await GetNumberCaptchaFromCacheAsync(registerForm.IpAddress);

            result.NumberCaptCha = captCha is null ? string.Empty : captCha.NumberCaptchaData.Picture;
            
            // Sanitize the signUpRequest data before logging
            var sanitizedSignUpData = SensitiveDataSanitizer.SanitizeJsonContent(JsonSerializer.Serialize(signUpRequest));
            var sanitizedCaptchaData = SensitiveDataSanitizer.SanitizeJsonContent(JsonSerializer.Serialize(captCha));
            
            var logMessage = $"Sign-up error from API: {result.ErrorCode} - {result.Message}:" +
                $" \nSignUpData: {sanitizedSignUpData} " +
                $"\nNumberCaptcha:{sanitizedCaptchaData}";
            await logService.SentryErrorAsync(logMessage);
            logService.LogFileMessage(logMessage);
        }
        else
        {
            // Sanitize the signUpRequest data before logging
            var sanitizedLogContent = SensitiveDataSanitizer.SanitizeJsonContent(JsonSerializer.Serialize(signUpRequest));
            await logService.SentryErrorAsync($"Sign-up error from API: {result.ErrorCode} - {result.Message}: \n{sanitizedLogContent}");
        }
    }

    private SignUpResponse GetSignUpHttpRequestException(HttpRequestException ex)
    {
        return new SignUpResponse
        {
            ErrorCode = 9999,
            Message = UI.Validation_CommonError,
            RawErrorCode = ex.StatusCode?.ToString() ?? string.Empty,
            RawMessage = ex.Message
        };
    }

    private SignUpResponse GetSignUpExceptionException(Exception ex)
    {
        return new SignUpResponse
        {
            ErrorCode = 9999,
            Message = UI.Validation_CommonError,
            RawMessage = ex.Message
        };
    }

    private SignUpResponse GetSignUpErrorResponse()
    {
        return new SignUpResponse
        {
            ErrorCode = 9998,
            Message = UI.Validation_CommonError
        };
    }

    private SignUp GetSignUpRequest(RegisterForm registerForm)
    {
        var signUp = new SignUp
        {
            Username = registerForm.Username,
            UserPwd = registerForm.Password,
            Email = registerForm.Email,
            PhoneNo = registerForm.PhoneNo,
            CurrencyId = registerForm.CurrencyId,
            AreaCode = registerForm.AreaCode,
            AffCode = registerForm.AffCode,
            CaptchaType = registerForm.CaptchaType,
            ReCaptchaToken = registerForm.ReCaptchaToken,
            AffClickId = registerForm.AffClickId,
            ReferralUrl = registerForm.ReferralUrl,
            UserLang = registerForm.UserLang
        };

        return signUp;
    }
}
