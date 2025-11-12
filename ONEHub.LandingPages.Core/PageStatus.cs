namespace ONEHub.LandingPages.Core;

/// <summary>
/// Page status enumeration
/// </summary>
public enum PageStatus
{
    /// <summary>
    /// Draft status - page is in draft mode
    /// </summary>
    Draft = 0,
    
    /// <summary>
    /// Active status - page is active and visible
    /// </summary>
    Active = 1,
    
    /// <summary>
    /// Inactive status - page is inactive and not visible
    /// </summary>
    Inactive = 2
}
