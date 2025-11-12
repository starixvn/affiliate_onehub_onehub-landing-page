using ONEHub.LandingPages.Core.Commands;
using ONEHub.LandingPages.Core.Models;
using ONEHub.LandingPages.Core.Services.Interfaces;
using Fanex.Data.Repository;
using ONEHub.Shared.Commands;
using ONEHub.Shared.Services.Interfaces;

namespace ONEHub.LandingPages.Core.Services;

public class TrackingSignUpService(IDynamicRepository dynamicRepository,
        IRabbitBus rabbitBus,
        IRedisService redisService,
        ICacheKeyService cacheKeyService,
        ILogProvider logService) : ITrackingSignUpService
{
    public async Task WriteLogSignUp(SignUpRequest signUpRequest)
    {
        var isSuceess = await rabbitBus.PublishAsync(signUpRequest);
        if (!isSuceess)
        {
            try
            {
                await redisService.ListRightPushAsync(cacheKeyService.GetFullKey(CacheKey.SignUp), signUpRequest);
            }
            catch (Exception ex)
            {
                await logService.SentryErrorAsync(ex);
                await WriteLogSignUpToDatabase(signUpRequest);
            }
        }
    }

    public async Task<CommandResult> WriteLogSignUpToDatabase(SignUpRequest signUpRequest)
    {
        var signUp = signUpRequest.SignUpData!;
        try
        {
            var response = signUpRequest.SignUpResponeData!;
            var command = new InsertSignUpLogCommand
            {
                Username = signUp.Username,
                Email = signUp.Email,
                PhoneNo = signUp.PhoneNo,
                AreaCode = signUp.AreaCode,
                CurrencyId = signUp.CurrencyId,
                CaptchaType = signUp.CaptchaType,
                ReCaptchaToken = signUp.ReCaptchaToken,
                AffClickId = signUp.AffClickId,
                AffCode = signUp.AffCode,
                UserLang = signUp.UserLang,
                ReferralUrl = signUp.ReferralUrl,
                IP = signUpRequest.IpAddress,
                Duration = signUpRequest.Duration,
                Status = signUpRequest.SignUpResponeData!.ErrorCode == 0 ? "success" : "error",
                APITraceId = response.TraceId,
                APIErrorCode = response.ErrorCode.ToString(),
                APIMessage = response.Message,
                ApiUrl = signUpRequest.ApiUrl,
                SignUpUrl = signUpRequest.SignUpUrl,
                UserAgent = signUpRequest.UserAgent,
                ExtData = signUpRequest.SignUpResponeData.NumberCaptCha
            };

            await dynamicRepository.ExecuteAsync(command);
            return new CommandResult
            {
                ErrorCode = command.ErrCode,
                ErrorMessage = command.ErrMsg ?? string.Empty
            };
        }
        catch (Exception ex)
        {
            await logService.SentryErrorAsync(ex);
            return new CommandResult
            {
                ErrorCode = 1,
                ErrorMessage = ex.Message ?? string.Empty
            };
        }
    }
}
