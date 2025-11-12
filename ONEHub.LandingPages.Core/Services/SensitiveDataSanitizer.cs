using System.Text.Json;

namespace ONEHub.LandingPages.Core.Services;

/// <summary>
/// Helper class to sanitize sensitive data from logging
/// </summary>
public static class SensitiveDataSanitizer
{
    private static readonly string[] SensitiveFields = 
    {
        "password", "pwd", "userpwd", "pass", "passwd",
        "token", "accesstoken", "refreshtoken", "bearertoken", "jwt",
        "cookie", "cookies", "session", "sessionid",
        "authorization", "auth", "apikey", "secret",
        "captchatoken"
    };

    private static readonly string[] SensitiveHeaders = 
    {
        "authorization", "cookie", "set-cookie", "x-api-key", "x-auth-token"
    };

    // Default timeout for sanitization operations (5 seconds)
    private static readonly TimeSpan DefaultTimeout = TimeSpan.FromSeconds(5);

    /// <summary>
    /// Sanitizes JSON content by removing or masking sensitive fields
    /// </summary>
    /// <param name="jsonContent">The JSON content to sanitize</param>
    /// <returns>Sanitized JSON content</returns>
    public static string SanitizeJsonContent(string jsonContent)
    {
        return SanitizeJsonContent(jsonContent, DefaultTimeout);
    }

    /// <summary>
    /// Sanitizes JSON content by removing or masking sensitive fields with timeout
    /// </summary>
    /// <param name="jsonContent">The JSON content to sanitize</param>
    /// <param name="timeout">The maximum time allowed for sanitization</param>
    /// <returns>Sanitized JSON content</returns>
    public static string SanitizeJsonContent(string jsonContent, TimeSpan timeout)
    {
        if (string.IsNullOrEmpty(jsonContent))
        {
            return jsonContent;
        }

        try
        {
            using var cts = new CancellationTokenSource(timeout);
            return SanitizeJsonContentInternal(jsonContent, cts.Token);
        }
        catch (OperationCanceledException)
        {
            // If timeout occurs, fall back to regex-based sanitization
            return SanitizeWithRegex(jsonContent);
        }
    }

    private static string SanitizeJsonContentInternal(string jsonContent, CancellationToken cancellationToken)
    {
        try
        {
            // Parse JSON to handle nested objects
            using var document = JsonDocument.Parse(jsonContent);
            var sanitizedObject = SanitizeJsonElement(document.RootElement, cancellationToken);
            return JsonSerializer.Serialize(sanitizedObject, new JsonSerializerOptions
            {
                WriteIndented = false
            });
        }
        catch
        {
            // If JSON parsing fails, use regex-based sanitization
            return SanitizeWithRegex(jsonContent);
        }
    }

    /// <summary>
    /// Sanitizes HTTP headers by removing or masking sensitive headers
    /// </summary>
    /// <param name="headers">Dictionary of headers</param>
    /// <returns>Sanitized headers dictionary</returns>
    public static Dictionary<string, string> SanitizeHeaders(Dictionary<string, string> headers)
    {
        var sanitized = new Dictionary<string, string>();
        
        foreach (var header in headers)
        {
            var key = header.Key.ToLowerInvariant();
            sanitized[header.Key] = SensitiveHeaders.Contains(key) ? "[REDACTED]" : header.Value;
        }
        
        return sanitized;
    }

    /// <summary>
    /// Sanitizes a single header value
    /// </summary>
    /// <param name="headerName">The header name</param>
    /// <param name="headerValue">The header value</param>
    /// <returns>Sanitized header value</returns>
    public static string SanitizeHeaderValue(string headerName, string headerValue)
    {
        var key = headerName.ToLowerInvariant();
        return SensitiveHeaders.Contains(key) ? "[REDACTED]" : headerValue;
    }

    private static object? SanitizeJsonElement(JsonElement element, CancellationToken cancellationToken)
    {
        // Check for cancellation before processing
        cancellationToken.ThrowIfCancellationRequested();

        if (element.ValueKind == JsonValueKind.Object)
        {
            return SanitizeJsonObject(element, cancellationToken);
        }
        
        if (element.ValueKind == JsonValueKind.Array)
        {
            return SanitizeJsonArray(element, cancellationToken);
        }
        
        if (element.ValueKind == JsonValueKind.String)
        {
            return GetStringValue(element);
        }
        
        if (element.ValueKind == JsonValueKind.Number)
        {
            return element.GetDecimal();
        }
        
        if (element.ValueKind == JsonValueKind.True)
        {
            return true;
        }
        
        if (element.ValueKind == JsonValueKind.False)
        {
            return false;
        }
        
        if (element.ValueKind == JsonValueKind.Null)
        {
            return null;
        }
        
        return GetRawTextValue(element);
    }

    private static string GetStringValue(JsonElement element)
    {
        return element.GetString() ?? string.Empty;
    }

    private static string GetRawTextValue(JsonElement element)
    {
        return element.GetRawText() ?? string.Empty;
    }

    private static Dictionary<string, object> SanitizeJsonObject(JsonElement element, CancellationToken cancellationToken)
    {
        var result = new Dictionary<string, object>();
        
        foreach (var property in element.EnumerateObject())
        {
            // Check for cancellation before processing each property
            cancellationToken.ThrowIfCancellationRequested();
            
            var key = property.Name.ToLowerInvariant();
            result[property.Name] = SensitiveFields.Contains(key) 
                ? "[REDACTED]" 
                : SanitizeJsonElement(property.Value, cancellationToken) ?? string.Empty;
        }
        
        return result;
    }

    private static List<object> SanitizeJsonArray(JsonElement element, CancellationToken cancellationToken)
    {
        var result = new List<object>();
        
        foreach (var item in element.EnumerateArray())
        {
            // Check for cancellation before processing each array item
            cancellationToken.ThrowIfCancellationRequested();
            
            var sanitizedItem = SanitizeJsonElement(item, cancellationToken);
            result.Add(sanitizedItem ?? string.Empty);
        }
        
        return result;
    }

    private static string SanitizeWithRegex(string content)
    {
        return SanitizeWithRegex(content, DefaultTimeout);
    }

    private static string SanitizeWithRegex(string content, TimeSpan timeout)
    {
        try
        {
            using var cts = new CancellationTokenSource(timeout);
            return SanitizeWithRegexInternal(content, cts.Token);
        }
        catch (OperationCanceledException)
        {
            // If timeout occurs, return a truncated version
            return content.Length > 1000 ? content.Substring(0, 1000) + "... [TRUNCATED DUE TO TIMEOUT]" : content;
        }
    }

    private static string SanitizeWithRegexInternal(string content, CancellationToken cancellationToken)
    {
        // Limit content size to prevent long operations
        if (content.Length > 5000)
        {
            content = content.Substring(0, 5000) + "... [TRUNCATED FOR PERFORMANCE]";
        }

        // Use simple string replacement instead of regex for better performance
        var result = content;
 
        foreach (var field in SensitiveFields)
        {
            // Check for cancellation before each operation
            cancellationToken.ThrowIfCancellationRequested();
            
            // Simple string replacement with timeout protection
            var pattern = $"\"{field}\":";
            var replacement = $"\"{field}\": \"[REDACTED]\"";
            
            if (result.Contains(pattern, StringComparison.OrdinalIgnoreCase))
            {
                result = result.Replace(pattern, replacement, StringComparison.OrdinalIgnoreCase);
            }
        }

        return result;
    }
}
