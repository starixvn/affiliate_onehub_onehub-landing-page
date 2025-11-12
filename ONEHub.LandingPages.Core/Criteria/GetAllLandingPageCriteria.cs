using Fanex.Data.Repository;

namespace ONEHub.LandingPages.Core.Criteria;

public class GetAllLandingPageCriteria : CriteriaBase
{
    public bool IsPreview { get; set; }

    public override string GetSettingKey() => "Aff_LandingPage_Builder_AllSel";

    public override bool IsValid() => true;
}