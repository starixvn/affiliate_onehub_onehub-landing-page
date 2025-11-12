namespace ONEHub.LandingPages.Core
{
    public record SignUpFormConfig(
        int FormId,
        string FormCode,
        string FormType,
        string CssClass,
        bool IsEnableCurrency,
        bool IsEnableEmail,
        bool IsEnableAffiliate,
        bool IsEnableTermsAndCondition
    );

    public static class SignUpFormConfigs
    {
        // Define the base form configurations (F1-F10) with their boolean combinations
        private static readonly (string FormCode, string FormType, bool IsEnableCurrency, bool IsEnableEmail, bool IsEnableAffiliate, bool IsEnableTermsAndCondition)[] BaseFormConfigs = 
        {
            ("F1", "F1", true, true, true, true),
            ("F2", "F2", true, true, true, false),
            ("F3", "F3", false, true, true, true),
            ("F4", "F4", false, true, true, false),
            ("F5", "F5", false, true, false, true),
            ("F6", "F6", false, true, false, false),
            ("F7", "F7", false, true, false, true),
            ("F8", "F8", false, true, false, false),
            ("F9", "F9", false, false, false, true),
            ("F10", "F10", false, false, false, false)
        };

        private static readonly string[] CssClasses = 
        {
            "theme-gold", "theme-orange", "theme-yellow", "theme-green", 
            "theme-lightgreen", "theme-sky", "theme-navy", "theme-pink", "theme-purple"
        };

        public static readonly IReadOnlyList<SignUpFormConfig> SupportSignUpForms = GenerateFormConfigs().AsReadOnly();

        private static List<SignUpFormConfig> GenerateFormConfigs()
        {
            var configs = new List<SignUpFormConfig>();
            int formId = 1;

            for (int cssIndex = 0; cssIndex < CssClasses.Length; cssIndex++)
            {
                string cssClass = CssClasses[cssIndex];
                
                foreach (var baseConfig in BaseFormConfigs)
                {
                    string formCode = cssIndex == 0 ? baseConfig.FormCode : $"F{formId}";
                    
                    configs.Add(new SignUpFormConfig(
                        formId,
                        formCode,
                        baseConfig.FormType,
                        cssClass,
                        baseConfig.IsEnableCurrency,
                        baseConfig.IsEnableEmail,
                        baseConfig.IsEnableAffiliate,
                        baseConfig.IsEnableTermsAndCondition
                    ));
                    
                    formId++;
                }
            }

            return configs;
        }
    }
}
