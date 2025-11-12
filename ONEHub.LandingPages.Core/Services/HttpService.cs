using System.Text;
using System.Text.Json;
using ONEHub.LandingPages.Core.Constants;
using ONEHub.LandingPages.Core.Models;
using ONEHub.LandingPages.Core.Services.Interfaces;
using ONEHub.Shared.Services.Interfaces;

namespace ONEHub.LandingPages.Core.Services;

public class HttpService(IHttpClientFactory httpClientFactory, ILogProvider logProvider) : IHttpService
{
    public async Task<(T?, HttpResponseMessage)> PostAsync<T>(string url, string content)
    {
        HttpResponseMessage? response = null;
        HttpRequestMessage? request = null;
        try
        {
            using var httpClient = httpClientFactory.CreateClient(Settings.UseProxyWithForwardHeaders);
            var requestContent = new StringContent(content, Encoding.UTF8, "application/json");
            request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = requestContent;
            response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<T>(responseContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            await WriteLogRequest(request, response);

            return (result, response);
        }
        catch
        {
            await WriteLogRequest(request!, response);
            throw;
        }
    }

    private async Task WriteLogRequest(HttpRequestMessage request, HttpResponseMessage? response)
    {
        try
        {
            // Create dictionary for structured logging properties
            var logProperties = new Dictionary<string, object>
            {
                ["HttpMethod"] = request.Method.ToString(),
                ["RequestUri"] = request.RequestUri?.ToString() ?? string.Empty,
                ["RequestHeaders"] = SanitizeHeaders(request.Headers),
                ["RequestContentHeaders"] = new Dictionary<string, string>(),
                ["ResponseStatusCode"] = response?.StatusCode.ToString() ?? "N/A",
                ["ResponseReasonPhrase"] = response?.ReasonPhrase ?? "N/A",
                ["ResponseHeaders"] = new Dictionary<string, string>(),
                ["ResponseContentHeaders"] = new Dictionary<string, string>()
            };

            await ProcessRequestContent(request, logProperties);
            await ProcessResponse(response, logProperties);

            // Use structured logging with properties
            logProvider.LogFileMessageWithProperties("HTTP Request/Response completed", logProperties);
        }
        catch
        {
            logProvider.LogFileMessage("Cannot Write Log HTTP Request");
        }
    }

    private static Dictionary<string, string> SanitizeHeaders(IEnumerable<KeyValuePair<string, IEnumerable<string>>> headers)
    {
        var sanitizedHeaders = new Dictionary<string, string>();
        foreach (var header in headers)
        {
            var sanitizedValue = SensitiveDataSanitizer.SanitizeHeaderValue(header.Key, string.Join(", ", header.Value));
            sanitizedHeaders[header.Key] = sanitizedValue;
        }
        return sanitizedHeaders;
    }

    private async Task ProcessRequestContent(HttpRequestMessage request, Dictionary<string, object> logProperties)
    {
        if (request.Content == null)
        {
            return;
        }

        var requestContentHeaders = (Dictionary<string, string>)logProperties["RequestContentHeaders"];
        foreach (var header in request.Content.Headers)
        {
            var sanitizedValue = SensitiveDataSanitizer.SanitizeHeaderValue(header.Key, string.Join(", ", header.Value));
            requestContentHeaders[header.Key] = sanitizedValue;
        }

        var requestBody = await request.Content.ReadAsStringAsync();
        var sanitizedRequestBody = SensitiveDataSanitizer.SanitizeJsonContent(requestBody);
        logProperties["RequestBody"] = sanitizedRequestBody;
    }

    private async Task ProcessResponse(HttpResponseMessage? response, Dictionary<string, object> logProperties)
    {
        if (response == null)
        {
            return;
        }

        var responseHeaders = (Dictionary<string, string>)logProperties["ResponseHeaders"];
        foreach (var header in response.Headers)
        {
            var sanitizedValue = SensitiveDataSanitizer.SanitizeHeaderValue(header.Key, string.Join(", ", header.Value));
            responseHeaders[header.Key] = sanitizedValue;
        }

        if (response.Content == null)
        {
            return;
        }

        var responseContentHeaders = (Dictionary<string, string>)logProperties["ResponseContentHeaders"];
        foreach (var header in response.Content.Headers)
        {
            var sanitizedValue = SensitiveDataSanitizer.SanitizeHeaderValue(header.Key, string.Join(", ", header.Value));
            responseContentHeaders[header.Key] = sanitizedValue;
        }

        var responseBody = await response.Content.ReadAsStringAsync();
        var sanitizedResponseBody = SensitiveDataSanitizer.SanitizeJsonContent(responseBody);
        logProperties["ResponseBody"] = sanitizedResponseBody;
        BaseResponse? result = GetResponse(responseBody);

        logProperties["ErrCode"] = result?.ErrorCode ?? 0;
    }

    private static BaseResponse? GetResponse(string responseBody)
    {
        try
        {
            return JsonSerializer.Deserialize<BaseResponse>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch
        {
            return null;
        }
    }
}
