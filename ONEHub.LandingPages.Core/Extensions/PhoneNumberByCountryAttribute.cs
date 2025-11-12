namespace ONEHub.LandingPages.Core.Extensions;

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using PhoneNumbers;
using System.Reflection;
using ONEHub.LandingPages.Core.Resources;

[AttributeUsage(AttributeTargets.Property)]
public sealed class PhoneNumberByCountryAttribute : ValidationAttribute, IClientModelValidator
{
    public string CountryProperty { get; }

    public PhoneNumberByCountryAttribute(string countryProperty)
    {
        CountryProperty = countryProperty ?? throw new ArgumentNullException(nameof(countryProperty));
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (validationContext is null)
        {
            throw new ArgumentNullException(nameof(validationContext));
        }

        if (value is not string phoneNumber || string.IsNullOrWhiteSpace(phoneNumber))
        {
            return ValidationResult.Success;
        }

        var countryProp = validationContext.ObjectType.GetProperty(CountryProperty, BindingFlags.Public | BindingFlags.Instance);
        var country = countryProp?.GetValue(validationContext.ObjectInstance, null)?.ToString();

        var phoneUtil = PhoneNumberUtil.GetInstance();
        try
        {
            var parsed = phoneUtil.Parse(phoneNumber, country);
            if (phoneUtil.IsValidNumber(parsed))
            {
                return ValidationResult.Success;
            }
        }
        catch (Exception)
        {
            // Swallow exception as per original logic, but consider logging in real scenarios.
        }

        return new ValidationResult(string.Format(UI.PhoneNumber_InvalidForCountryWithCode, country));
    }

    public void AddValidation(ClientModelValidationContext context)
    {
        if (context is null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        MergeAttribute(context.Attributes, "data-val", "true");
        MergeAttribute(context.Attributes, "data-val-phonenocountry", ErrorMessage ?? UI.Validation_PhoneInvalid);
        MergeAttribute(context.Attributes, "data-val-phonenocountry-countryproperty", CountryProperty);
    }

    private static void MergeAttribute(IDictionary<string, string> attributes, string key, string value)
    {
        if (!attributes.ContainsKey(key))
        {
            attributes.Add(key, value);
        }
    }
}
