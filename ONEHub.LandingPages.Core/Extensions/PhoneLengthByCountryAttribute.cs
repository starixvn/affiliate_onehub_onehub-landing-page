namespace ONEHub.LandingPages.Core.Extensions;

using ONEHub.LandingPages.Core.Resources;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

[AttributeUsage(AttributeTargets.Property)]
public sealed class PhoneLengthByCountryAttribute : ValidationAttribute, IClientModelValidator
{
    public static readonly IReadOnlyList<CountryInfo> Countries = new List<CountryInfo>
    {
        new("MY", 9, 10),
        new("ID", 10, 13),
        new("CN", 10, 11),
        new("IN", 10, 10),
        new("TH", 9, 9),
        new("BD", 10, 10),
        new("KH", 9, 9),
        new("VN", 9, 9),
        new("KR", 9, 10),
        new("JP", 10, 10),
        new("BR", 10, 11),
        new("PH", 11, 11)
    }.AsReadOnly();

    public string CountryProperty { get; }

    public PhoneLengthByCountryAttribute(string countryProperty)
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
        var country = countryProp?.GetValue(validationContext.ObjectInstance, null)?.ToString() ?? string.Empty;

        return ValidateLength(country, phoneNumber);
    }

    private ValidationResult? ValidateLength(string countryCode, string phoneNumber)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(phoneNumber) || string.IsNullOrWhiteSpace(countryCode))
            {
                return ValidationResult.Success;
            }

            var country = Countries.FirstOrDefault(t => countryCode.Equals(t.CountryCode, StringComparison.OrdinalIgnoreCase));
            if (country is not null)
            {
                var phoneNumberLength = phoneNumber.Length;
                if (phoneNumberLength >= country.MinLength && phoneNumberLength <= country.MaxLength)
                {
                    return ValidationResult.Success;
                }
                else
                {
                    string message = country.MinLength == country.MaxLength
                        ? string.Format(UI.Validation_PhoneLength, country.MinLength)
                        : string.Format(UI.Validation_PhoneLengthRange, country.MinLength, country.MaxLength);

                    return new ValidationResult(message);
                }
            }
            else
            {
                return ValidationResult.Success;
            }
        }
        catch {
            return ValidationResult.Success;
        }
    }

    public void AddValidation(ClientModelValidationContext context)
    {
        if (context is null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        MergeAttribute(context.Attributes, "data-val", "true");
        MergeAttribute(context.Attributes, "data-val-phonenocountry", UI.Validation_PhoneLength);

        var json = System.Text.Json.JsonSerializer.Serialize(Countries);
        MergeAttribute(context.Attributes, "data-val-phonenocountry-map", json);
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

public record CountryInfo(
    string CountryCode,
    int MinLength,
    int MaxLength
);
