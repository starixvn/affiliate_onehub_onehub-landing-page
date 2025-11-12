namespace ONEHub.LandingPages.Core.Services;

/// <summary>
/// Service for common validation operations
/// </summary>
public static class ValidationService
{
    /// <summary>
    /// Validates that a string parameter is not null or empty
    /// </summary>
    /// <param name="value">Value to validate</param>
    /// <param name="parameterName">Name of the parameter for error messages</param>
    /// <returns>True if valid, false otherwise</returns>
    public static bool ValidateRequiredString(string? value, string parameterName)
    {
        return !string.IsNullOrWhiteSpace(value);
    }

    /// <summary>
    /// Validates that an object is not null
    /// </summary>
    /// <param name="value">Value to validate</param>
    /// <param name="parameterName">Name of the parameter for error messages</param>
    /// <returns>True if valid, false otherwise</returns>
    public static bool ValidateRequiredObject(object? value, string parameterName)
    {
        return value != null;
    }

    /// <summary>
    /// Gets a validation error message for a required parameter
    /// </summary>
    /// <param name="parameterName">Name of the parameter</param>
    /// <returns>Error message</returns>
    public static string GetRequiredParameterErrorMessage(string parameterName)
    {
        return $"{parameterName} is required";
    }
}
