namespace ONEHub.LandingPages.Core.Models;

public class LandingPageModule
{
    public int PageId { get; set; }

    public int ModuleId { get; set; }

    public int OrderId { get; set; }

    public int MediaId { get; set; }

    public string? MediaCode { get; set; }

    public string ExtraInfo { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string MediaName { get; set; } = string.Empty;

    public string Dimension { get; set; } = string.Empty;

    public int ModuleType { get; set; }

    public int NavigateTo { get; set; }

    public bool IsRequired { get; set; }

    public bool IsUnique { get; set; }

    public string RowVer { get; set; } = string.Empty;

    public string GetFullMediaLink(string rootDomain)
    {
        var fileName = Uri.EscapeDataString(FileName);
        var fullLink = $"{rootDomain}/{fileName}?v={RowVer}";
        return fullLink;
    }
}
