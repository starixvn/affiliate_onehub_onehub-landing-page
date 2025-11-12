using ONEHub.LandingPages.Core.Commands;
using ONEHub.LandingPages.Core.Models;
using ONEHub.Shared.Commands;

namespace ONEHub.LandingPages.Core.Services.Interfaces;

public interface ITrackingSignUpService
{
    Task WriteLogSignUp(SignUpRequest signUpRequest);

    Task<CommandResult> WriteLogSignUpToDatabase(SignUpRequest signUpRequest);
}
