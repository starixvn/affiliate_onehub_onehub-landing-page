using Fanex.Data.Repository;

namespace ONEHub.LandingPages.Core.Criteria;

public class GetAllLandingPageCriteria : CriteriaBase
{
    public bool IsPreview { get; set; }

    public override string GetSettingKey() => "OH_PageBuilder_AllSel";

    public override bool IsValid() => true;
}