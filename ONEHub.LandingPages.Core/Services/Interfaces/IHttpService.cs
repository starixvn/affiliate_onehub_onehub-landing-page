namespace ONEHub.LandingPages.Core.Services.Interfaces;

/// <summary>
/// Interface for HTTP POST service operations
/// </summary>
public interface IHttpService
{
    /// <summary>
    /// Performs an HTTP POST request with the specified content and language code
    /// </summary>
    /// <typeparam name="T">The type of response to deserialize</typeparam>
    /// <param name="url">The URL endpoint for the POST request</param>
    /// <param name="content">The JSON content to send in the request body</param>
    /// <param name="langCode">The language code for the request</param>
    /// <returns>A task that represents the asynchronous operation and contains the response of type T</returns>
    Task<(T?, HttpResponseMessage)> PostAsync<T>(string url, string content);
}
