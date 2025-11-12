using Microsoft.AspNetCore.Http;

namespace ONEHub.LandingPages.Core.Extensions;

public class ForwardHeadersHandler : DelegatingHandler
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ForwardHeadersHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var context = _httpContextAccessor.HttpContext;
        if (context != null)
        {
            var headers = HeaderForwardingHelper.BuildForwardHeaders(context);

            foreach (var header in headers.Where(h => !request.Headers.Contains(h.Key)))
            {
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }
        }

        return base.SendAsync(request, cancellationToken);
    }
}
