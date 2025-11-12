using System.Text.Json.Serialization;
using ONEHub.LandingPages.Core.Converters;

namespace ONEHub.LandingPages.Core.Models;

public class ScheduleMaintenance
{
    public bool Maintain { get; set; }
    public DateTimeOffset DateTimeStart { get; set; }
    
    [JsonConverter(typeof(UnixTimestampConverter))]
    public long UTCTimeStart { get; set; }
    
    public DateTimeOffset DateTimeEnd { get; set; }
    
    [JsonConverter(typeof(UnixTimestampConverter))]
    public long UTCTimeEnd { get; set; }
    
    public List<string>? ExcludeDomain { get; set; }
}
