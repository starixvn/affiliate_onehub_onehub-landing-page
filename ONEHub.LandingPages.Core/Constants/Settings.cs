namespace ONEHub.LandingPages.Core.Constants;

public static class Settings
{
    public const string QueueIdentify = "12b.user.signup";
    public const string CacheRedisQueueName = "Aff.12B.LandingPage.SignUp";
    public const string TurnOnErrorQueueConsumer = "Aff.12B.LandingPage.TurnOnErrorQueueConsumer";

    public const string MainExchangeName = $"{QueueIdentify}.exchange";
    public const string RetryExchangeName = $"{QueueIdentify}.retry.exchange";
    public const string ErrorExchangeName = $"{QueueIdentify}.error.exchange";
    public const string MainQueueName = $"{QueueIdentify}.queue";
    public const string RetryQueueName = $"{QueueIdentify}.retry.queue";
    public const string ErrorQueueName = $"{QueueIdentify}.error.queue";
    public const string RoutingKey = $"{QueueIdentify}.routing";


    public const string UseProxyWithForwardHeaders = "UseProxyWithForwardHeaders";
    public const string UseProxy = "UseProxy";
}
