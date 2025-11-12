namespace ONEHub.LandingPages.Core
{
    public record CountryInfo(
        string Country,
        string ContryCode,
        string Currency,
        string DialCode,
        int MinLength,
        int MaxLength
    );

    public static class CountryData
    {
        public static readonly IReadOnlyList<CountryInfo> Countries = new List<CountryInfo>
        {
            new("Malaysia",     "MY", "MYR", "+60",  9, 10),
            new("Indonesia",    "ID", "IDR", "+62", 10, 13),
            new("China",        "CN", "CNY", "+86", 10, 11),
            new("India",        "IN", "INR", "+91", 10, 10),
            new("Thailand",     "TH", "THB", "+66", 9, 9),
            new("Bangladesh",   "BD", "BDT", "+880", 10, 10),
            new("Cambodia",     "KH", "KHR", "+855", 9, 9),
            new("Vietnam",      "VN", "VND", "+84", 9, 9),
            new("South Korea",  "KR", "KRW", "+82", 9, 10),
            new("Japan",        "JP", "JPY", "+81", 10, 10),
            new("Brazil",       "BR", "BRL", "+55", 10, 11),
            new("Philippines",  "PH", "PHP", "+63", 11, 11)
        }.AsReadOnly();  
    }
}
