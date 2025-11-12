/**
 * Site JavaScript Module
 * Handles form validation, UI interactions, and user experience enhancements
 * @author Fanex Affiliate Team
 * @version 1.0.0
 */

import $ from 'jquery';
import 'jquery-validation';
import 'jquery-validation-unobtrusive';
import { parsePhoneNumberFromString } from 'libphonenumber-js/core';
import metadata from 'libphonenumber-js/metadata.mobile.json';
import './capcha.js';
import { tracking } from './tracker';

// Constants
const SITE_CONFIG = {
    SELECTORS: {
        REGISTER_FORM: '#register-form',
        ISSUCCESSFUL: "#IsSuccessful",
        REDIRECTURL: "#RedirectUrl",
        GO_TOP_BTN: '#goTopBtn',
        USERNAME_INPUT: '#Username',
        PASSWORD_INPUT: '#UserPwd',
        HIDDEN_PASSWORD: '#Password',
        INPUT_VALIDATION_ERROR: '.input-validation-error',
        VALIDATION_SUMMARY: '.validation-summary-errors, .validation-summary-valid.text-danger',
        INPUT_FIELD: '.input-field',
        INPUT_BOX: '.input-box',
        INPUT_INFO: '.input-info',
        ICON_INFORMATION: '.icon-info',
        ICON_EYE: '.icon-eye',
        ICON_EYE_SLASH: '.icon-eye-slash',
        SWIPER_CONTAINER: '.swiper-container',
        SWIPER: '.swiper',
        SWIPER_SLIDE: '.swiper-slide',
        SWIPER_PAGINATION: '.swiper-pagination'
    },
    CLASSES: {
        INPUT_VALID: 'input-valid',
        INPUT_ERROR: 'input-error',
        ACTIVE: 'active'
    },
    TIMEOUTS: {
        SCROLL_ANIMATION: 500,
        GO_TOP_ANIMATION: 400,
        REMOTE_VALIDATION_DEBOUNCE: 500,
        SWIPER_AUTOPLAY_DELAY: 2500
    },
    SCROLL_THRESHOLDS: {
        GO_TOP_VISIBILITY: 200,
        SCROLL_OFFSET: 100
    },
    SWIPER_CONFIG: {
        SLIDES_PER_VIEW: 1,
        SPACE_BETWEEN: 20,
        PADDING_BOTTOM: {
            SINGLE_SLIDE: '12px',
            MULTIPLE_SLIDES: '30px'
        }
    },
    FORM_EXCEPTIONS: [
        '.scroll-to-top',
        '.swiper-pagination'
    ],
    PHONE_TYPES: {
        MOBILE: 'MOBILE',
        FIXED_LINE_OR_MOBILE: 'FIXED_LINE_OR_MOBILE'
    },
    PASSWORD_PLACEHOLDER: 'ZHNkc2RzZGRZA'
};

// Private variables
let isInitialized = false;
let swiperInstances = [];

setupPhoneValidation(); //must run first
// Lazy load Swiper only when needed
initializeSwiperLazy();

/**
 * Initialize site functionality
 * @private
 */
function initializeSite() {
    if (isInitialized) {
        return;
    }

    try {
        handleSubmitSuccess();
        initializeComponents();
        setupFormHandlers();
        setupValidationStyles();
        handleInitialValidationErrors();
        isInitialized = true;
    } catch (error) {
        console.error('Failed to initialize site:', error);
    }
}

/**
 * Setup phone number validation
 * @private
 */
function setupPhoneValidation() {
    // Register phone validation adapter
    $.validator.unobtrusive.adapters.add("phonenocountry", ["countryproperty"], function (options) {
        options.rules["phonenocountry"] = {
            countryProperty: options.params.countryproperty
        };
        options.messages["phonenocountry"] = options.message;
    });

    // Add phone validation method
    $.validator.addMethod("phonenocountry", function (value, element, params) {
        if (!value) {
            return true;
        }

        try {
            const countryCodeFieldName = `${params.countryProperty}`;
            const countryCode = $(`[name='${countryCodeFieldName}']`).val();

            if (!countryCode) {
                return true;
            }

            const phoneNumber = parsePhoneNumberFromString(value, countryCode, metadata);
            if (!phoneNumber || !phoneNumber.isValid()) {
                return false;
            }

            const phoneType = phoneNumber.getType();
            return phoneType === SITE_CONFIG.PHONE_TYPES.MOBILE ||
                phoneType === SITE_CONFIG.PHONE_TYPES.FIXED_LINE_OR_MOBILE;
        } catch (error) {
            console.error('Phone validation error:', error);
            return false;
        }
    }, window.validationMessages?.phoneNumberInvalid || "Invalid phone number for the selected country.");
}

function handleSubmitSuccess() {
    // MetaPixel.checkStatus() - moved to tracker
    const $isSuccessfulElement = $(SITE_CONFIG.SELECTORS.ISSUCCESSFUL);
    const isSuccessfulValue = $isSuccessfulElement.val();

    if (isSuccessfulValue === "true") {
        const username = $(SITE_CONFIG.SELECTORS.USERNAME_INPUT).val();
        tracking({
           eventName: 'CompleteRegistration',
           eventValue: username
        });
        
        // Show the redirect overlay (HTML is already in the page)
        $('#redirect-overlay').show();
        // Prevent scrolling
        $('body').addClass('redirect-overlay-active');
        
        const redirectUrl = $(SITE_CONFIG.SELECTORS.REDIRECTURL).val();
        if (redirectUrl) {
            setTimeout(function () {
                window.location.href = redirectUrl;
            }, 600);
        }
    }
}

function scrollToForm() {
    const $form = $(SITE_CONFIG.SELECTORS.USERNAME_INPUT);
    if ($form.length > 0) {
        console.log('📜 Scrolling to form after successful submission');
        scrollToElement($form);
    }
}
/**
 * Initialize all components
 * @private
 */
function initializeComponents() {
    initializeGoTopButton();
    initializeInputInfoToggle();
    initializePasswordToggle();
    initializeFormScrollBack();

    enableRemoteValidationDebounce(SITE_CONFIG.TIMEOUTS.REMOTE_VALIDATION_DEBOUNCE);
}

/**
 * Setup form event handlers
 * @private
 */
function setupFormHandlers() {
    const $form = $(SITE_CONFIG.SELECTORS.REGISTER_FORM);

    if ($form.length === 0) {
        console.warn('Register form not found');
        return;
    }

    $form.on("submit", function (event) {
        event.preventDefault();
        try {
            // Cancel any pending remote validation
            if (typeof window.cancelRemoteValidation === 'function') {
                window.cancelRemoteValidation();
            }

            if ($form.valid()) {
                handlePasswordEncoding();

                const username = $(SITE_CONFIG.SELECTORS.USERNAME_INPUT).val();
                tracking({
                   eventName: 'registerSubmit',
                   eventValue: username
                });

                setTimeout(() => { this.submit(); }, 100);

                console.log('submit done');
            } else {
                // Scroll to first error after a short delay to allow validation to complete
                setTimeout(() => {
                    const $firstError = $('.input-validation-error').first();
                    if ($firstError.length > 0) {
                        scrollToElement($firstError, () => $firstError.focus());
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Form submission error:', error);
        }
    });
}


/**
 * Handle password encoding for security
 * @private
 */
function handlePasswordEncoding() {
    const $passwordInput = $(SITE_CONFIG.SELECTORS.PASSWORD_INPUT);
    const $hiddenPassword = $(SITE_CONFIG.SELECTORS.HIDDEN_PASSWORD);

    if ($passwordInput.length === 0 || $hiddenPassword.length === 0) {
        console.warn('Password input fields not found');
        return;
    }

    const passwordValue = $passwordInput.val();
    if (passwordValue) {
        try {
            const encodedPassword = btoa(unescape(encodeURIComponent(passwordValue)));
            $passwordInput.val(SITE_CONFIG.PASSWORD_PLACEHOLDER);
            $hiddenPassword.val(encodedPassword);
        } catch (error) {
            console.error('Password encoding error:', error);
        }
    }
}

/**
 * Setup validation styles
 * @private
 */
function setupValidationStyles() {
    const $form = $(SITE_CONFIG.SELECTORS.REGISTER_FORM);
    const validator = $form.data("validator");

    if (!validator) {
        return;
    }

    validator.settings.highlight = function (element) {
        $(element).closest(SITE_CONFIG.SELECTORS.INPUT_BOX)
            .removeClass(SITE_CONFIG.CLASSES.INPUT_VALID)
            .addClass(SITE_CONFIG.CLASSES.INPUT_ERROR);
    };

    validator.settings.unhighlight = function (element) {
        $(element).closest(SITE_CONFIG.SELECTORS.INPUT_BOX)
            .removeClass(SITE_CONFIG.CLASSES.INPUT_ERROR)
            .addClass(SITE_CONFIG.CLASSES.INPUT_VALID);
    };
}

/**
 * Handle initial validation errors
 * @private
 */
function handleInitialValidationErrors() {
    const $firstErrorField = $(SITE_CONFIG.SELECTORS.INPUT_VALIDATION_ERROR).first();

    if ($firstErrorField.length > 0) {
        scrollToElement($firstErrorField, () => $firstErrorField.focus());
    } else {
        const $summary = $(SITE_CONFIG.SELECTORS.VALIDATION_SUMMARY).first();
        if ($summary.length > 0) {
            scrollToElement($summary);
        }
    }
}

/**
 * Scroll to element with animation
 * @param {jQuery} $element - Element to scroll to
 * @param {Function} callback - Optional callback after scroll
 * @private
 */
function scrollToElement($element, callback) {
    if ($element.length === 0) {
        return;
    }

    const offset = $element.offset();
    if (!offset) {
        return;
    }

    $('html, body').animate({
        scrollTop: offset.top - SITE_CONFIG.SCROLL_THRESHOLDS.SCROLL_OFFSET
    }, SITE_CONFIG.TIMEOUTS.SCROLL_ANIMATION, callback);
}

/**
 * Initialize Go To Top button
 * @private
 */
function initializeGoTopButton() {
    const $goTopBtn = $(SITE_CONFIG.SELECTORS.GO_TOP_BTN);

    if ($goTopBtn.length === 0) {
        return;
    }

    function toggleGoTopButton() {
        const scrollTop = $(window).scrollTop();
        const isVisible = scrollTop > SITE_CONFIG.SCROLL_THRESHOLDS.GO_TOP_VISIBILITY;

        $goTopBtn.css("display", isVisible ? "flex" : "none");
    }

    // Initial check
    toggleGoTopButton();

    // Bind scroll event
    $(window).on("scroll.site", toggleGoTopButton);

    // Bind click event
    $goTopBtn.on("click.site", function () {
        $("html, body").animate({
            scrollTop: 0
        }, SITE_CONFIG.TIMEOUTS.GO_TOP_ANIMATION);
    });
}

/**
 * Initialize input info toggle functionality
 * @private
 */
function initializeInputInfoToggle() {
    const { INPUT_FIELD, INPUT_INFO, ICON_INFORMATION } = SITE_CONFIG.SELECTORS;
    const { ACTIVE } = SITE_CONFIG.CLASSES;

    $(document).on("click.site", ICON_INFORMATION, function (e) {
        e.stopPropagation();
        const $current = $(this).closest(INPUT_FIELD).find(INPUT_INFO);
        $(INPUT_INFO).not($current).removeClass(ACTIVE);
        $current.toggleClass(ACTIVE);
    });

    $(document).on("click.site", function (e) {
        if (!$(e.target).is(ICON_INFORMATION) && !$(e.target).closest(INPUT_INFO).length) {
            $(INPUT_INFO).removeClass(ACTIVE);
        }
    });
}

/**
 * Initialize password visibility toggle
 * @private
 */
function initializePasswordToggle() {
    $(SITE_CONFIG.SELECTORS.INPUT_FIELD).each(function () {
        const $field = $(this);
        const $input = $field.find('input[type="password"], input[type="text"]');
        const $eye = $field.find(SITE_CONFIG.SELECTORS.ICON_EYE);
        const $eyeSlash = $field.find(SITE_CONFIG.SELECTORS.ICON_EYE_SLASH);

        if ($input.length && $eye.length && $eyeSlash.length) {
            $eye.add($eyeSlash).on("click.site", function () {
                const isPassword = $input.attr("type") === "password";
                $input.attr("type", isPassword ? "text" : "password");
                $eye.toggle(isPassword);
                $eyeSlash.toggle(!isPassword);
            });
        }
    });
}

/**
 * Initialize form scroll back functionality
 * @private
 */
function initializeFormScrollBack() {
    const $form = $(SITE_CONFIG.SELECTORS.REGISTER_FORM);

    if ($form.length === 0) {
        return;
    }

    $(document).on("click.site", function (event) {
        const $target = $(event.target);
        const isInsideForm = $form.has($target).length > 0 || $form.is($target);
        const isException = SITE_CONFIG.FORM_EXCEPTIONS.some(selector =>
            $target.closest(selector).length > 0
        );

        if (!isInsideForm && !isException) {
            $form[0].scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
}

/**
 * Initialize Swiper carousels with lazy loading
 * @private
 */
function initializeSwiperLazy() {
    const $containers = $(SITE_CONFIG.SELECTORS.SWIPER_CONTAINER);

    if ($containers.length === 0) {
        return;
    }

    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initializeSwiperForContainer($(entry.target));
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px' });

        $containers.each(function () {
            observer.observe(this);
        });
    } else {
        // Fallback for older browsers
        $containers.each(function () {
            initializeSwiperForContainer($(this));
        });
    }
}

/**
 * Initialize Swiper for a specific container
 * @param {jQuery} $container - Container element
 * @private
 */

async function initializeSwiperForContainer($container) {
    const $swiperEl = $container.find(SITE_CONFIG.SELECTORS.SWIPER).first();
    if ($swiperEl.length === 0) return;

    const slideCount = $swiperEl.find(SITE_CONFIG.SELECTORS.SWIPER_SLIDE).length;
    const slidesPerView = SITE_CONFIG.SWIPER_CONFIG.SLIDES_PER_VIEW || 1;
    const slidesPerGroup = 1;
    const canLoop = slideCount >= (slidesPerView + slidesPerGroup);

    try {
        const SwiperModule = await import('swiper/swiper-bundle.mjs');
        const Swiper = SwiperModule.default || SwiperModule.Swiper;

        const paginationEl = $container.find(SITE_CONFIG.SELECTORS.SWIPER_PAGINATION)[0];
        const $pagination = $container.find(SITE_CONFIG.SELECTORS.SWIPER_PAGINATION);

        const swiperInstance = new Swiper($swiperEl[0], {
            slidesPerView: slidesPerView,
            spaceBetween: SITE_CONFIG.SWIPER_CONFIG.SPACE_BETWEEN,
            pagination: {
                el: paginationEl,
                clickable: true,
            },
            loop: canLoop,
            loopAdditionalSlides: canLoop && slideCount <= slidesPerView ? 1 : 0,
            autoplay: slideCount > 1 ? {
                delay: SITE_CONFIG.TIMEOUTS.SWIPER_AUTOPLAY_DELAY,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                waitForTransition: false
            } : false,
            speed: 500,
            allowTouchMove: slideCount > 1,
            loopPreventsSlide: false,
            loopPreventsSliding: false
        });

        swiperInstances.push(swiperInstance);

        if (slideCount > 1) {
            $swiperEl.css("padding-bottom", SITE_CONFIG.SWIPER_CONFIG.PADDING_BOTTOM.MULTIPLE_SLIDES);
            $pagination.css("display", "block");
        } else {
            $pagination.css("display", "none");
            $swiperEl.css("padding-bottom", SITE_CONFIG.SWIPER_CONFIG.PADDING_BOTTOM.SINGLE_SLIDE);
        }
    } catch (error) {
        console.error('Swiper initialization error:', error);
    }
}


/**
 * Enable remote validation with debounce
 * @param {number} delayMs - Debounce delay in milliseconds
 * @private
 */
function enableRemoteValidationDebounce(delayMs) {
    let debounceTimer = null;
    let currentXhr = null;

    // Store reference to cancel function globally
    window.cancelRemoteValidation = function () {
        if (currentXhr) {
            currentXhr.abort();
            currentXhr = null;
        }
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    };

    $.validator.methods.remote = function (value, element, param) {
        const previous = this.previousValue(element);

        if (!value) {
            if (previous) {
                previous.old = null;
                previous.valid = true;
            }

            if (currentXhr) {
                currentXhr.abort();
                currentXhr = null;
            }

            this.stopRequest(element, true);
            return true;
        }

        if (!this.settings.messages[element.name]) {
            this.settings.messages[element.name] = {};
        }

        if (previous.old === value) {
            return previous.valid;
        }

        previous.old = value;
        clearTimeout(debounceTimer);

        const validator = this;

        debounceTimer = setTimeout(() => {
            if (currentXhr) {
                currentXhr.abort();
            }

            validator.startRequest(element);

            currentXhr = $.ajax($.extend(true, {
                url: param.url || param,
                mode: "abort",
                port: "remote" + element.name,
                dataType: "json",
                data: (() => {
                    const data = {};
                    data[element.name] = value;
                    return data;
                })(),
                success: function (response) {
                    const valid = response === true || response === "true";
                    const errors = {};

                    if (valid) {
                        const submitted = validator.formSubmitted;
                        validator.resetInternals();
                        validator.toHide = validator.errorsFor(element);
                        validator.formSubmitted = submitted;
                        validator.successList.push(element);
                        validator.invalid[element.name] = false;
                        validator.showErrors();
                    } else {
                        const message = response || validator.defaultMessage(element, "remote");
                        validator.settings.messages[element.name].remote = previous.originalMessage = message;
                        errors[element.name] = message;
                        validator.invalid[element.name] = true;
                        validator.showErrors(errors);
                    }
                    previous.valid = valid;
                    validator.stopRequest(element, valid);
                },
                error: function (xhr, status, error) {
                    console.error('Remote validation error:', { status, error });
                    validator.stopRequest(element, false);
                }
            }, param));
        }, delayMs);

        return "pending";
    };
}

/**
 * Cleanup resources and event handlers
 * @public
 */
function cleanup() {
    // Remove event handlers
    $(window).off("scroll.site");
    $(document).off("click.site");
    $(SITE_CONFIG.SELECTORS.GO_TOP_BTN).off("click.site");
    $(SITE_CONFIG.SELECTORS.INPUT_FIELD).find(SITE_CONFIG.SELECTORS.ICON_EYE + ', ' + SITE_CONFIG.SELECTORS.ICON_EYE_SLASH).off("click.site");

    // Destroy Swiper instances
    swiperInstances.forEach(instance => {
        if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
        }
    });
    swiperInstances = [];

    isInitialized = false;
}

// Initialize when DOM is ready
$(document).ready(function () {
    initializeSite();
    
    // Check for validation summary errors (like captcha failures) after page load
    setTimeout(() => {
        const $validationSummary = $('.validation-summary-errors');
        if ($validationSummary.length > 0) {
            scrollToElement($validationSummary);
        }
    }, 100);
});


// Cleanup on page unload
$(window).on('beforeunload', function () {
    cleanup();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSite,
        cleanup,
        SITE_CONFIG
    };
}