/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/adjust.ts":
/*!**************************!*\
  !*** ./src/js/adjust.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AdjustTracker: () => (/* binding */ AdjustTracker)
/* harmony export */ });
/* harmony import */ var _baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./baseTrackerEvent */ "./src/js/baseTrackerEvent.ts");

const ADJUST_EVENT_TOKENS = {
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Purchase]: 'c82gz0',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.DepositSubmit]: 'z7faop',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.StartTrial]: 'id0tst',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Redeposit]: 'fnqjas',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.CompleteRegistration]: 'bzd00u',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.RegisterSubmit]: '7o95q5',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Withdraw]: 'ryscb2',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Login]: '',
};
const PUBLIC_ADJUST_TOKEN = 'e8xoahfuzqbk';
// Helper to check if string is empty
const isEmpty = (str) => !str || str.trim().length === 0;
// Adjust SDK
const isSDKAvailable = (win = window) => !isEmpty(PUBLIC_ADJUST_TOKEN) &&
    (win === null || win === void 0 ? void 0 : win.Adjust) !== undefined &&
    typeof (win === null || win === void 0 ? void 0 : win.Adjust.initSdk) === 'function' &&
    typeof (win === null || win === void 0 ? void 0 : win.Adjust.trackEvent) === 'function';
const AdjustTracker = (eventName, currency, revenue, eventParams) => {
    var _a;
    if (!isSDKAvailable(window) || !ADJUST_EVENT_TOKENS) {
        return;
    }
    const eventToken = ADJUST_EVENT_TOKENS[eventName];
    if (!eventToken) {
        return;
    }
    const createPartnerParams = (params) => {
        const entries = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const key in params) {
            if (Object.prototype.hasOwnProperty.call(params, key)) {
                entries.push({ key, value: params[key] });
            }
        }
        return entries;
    };
    const partnerParams = eventParams
        ? createPartnerParams(eventParams)
        : undefined;
    (_a = window.Adjust) === null || _a === void 0 ? void 0 : _a.trackEvent(Object.assign(Object.assign(Object.assign({ eventToken }, (currency && { currency })), (revenue && { revenue })), (partnerParams && { partnerParams })));
};


/***/ }),

/***/ "./src/js/baseTrackerEvent.ts":
/*!************************************!*\
  !*** ./src/js/baseTrackerEvent.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseTrackerEvent: () => (/* binding */ BaseTrackerEvent)
/* harmony export */ });
var BaseTrackerEvent;
(function (BaseTrackerEvent) {
    BaseTrackerEvent["RegisterSubmit"] = "registerSubmit";
    BaseTrackerEvent["DepositSubmit"] = "depositSubmit";
    BaseTrackerEvent["Purchase"] = "Purchase";
    BaseTrackerEvent["Withdraw"] = "withdraw";
    BaseTrackerEvent["CompleteRegistration"] = "CompleteRegistration";
    BaseTrackerEvent["StartTrial"] = "StartTrial";
    BaseTrackerEvent["Redeposit"] = "redeposit";
    BaseTrackerEvent["Login"] = "Login";
})(BaseTrackerEvent || (BaseTrackerEvent = {}));


/***/ }),

/***/ "./src/js/capcha.js":
/*!**************************!*\
  !*** ./src/js/capcha.js ***!
  \**************************/
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.min.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* module decorator */ module = __webpack_require__.hmd(module);
/**
 * Captcha Management Module
 * Handles both number captcha and Turnstile captcha functionality
 * @author Fanex Affiliate Team
 * @version 1.0.0
 */



// Constants
const CAPTCHA_CONFIG = {
    API_ENDPOINTS: {
        NUMBER_CAPTCHA: '/api/SignUp/GetNumberCaptcha'
    },
    TIMEOUTS: {
        RETRY_DELAY: 5000,
        DEFAULT_REFRESH: 300000
    },
    CAPTCHA_TYPES: {
        NUMBER: 0,
        TURNSTILE: 2
    },
    SELECTORS: {
        CAPTCHA_TYPE: '#CaptchaType',
        TOKEN_BOX: '#tokenBox',
        RECAPTCHA_TOKEN: '#ReCaptchaToken',
        NUMBER_CAPTCHA: '#numberCapcha',
        TURNSTILE_WIDGET: '#turnstile_widget',
        LANGUAGE_CODE: '#UserLang',
        ISSUCCESSFUL: "#IsSuccessful",
    }
};

// Private variables
let refreshTimeout = null;
let isInitialized = false;

/**
 * Initialize captcha functionality
 * @private
 */
function initializeCaptcha() {
    if (isInitialized) {
        return;
    }

    try {
        const captchaType = getCaptchaType();

        if (captchaType === CAPTCHA_CONFIG.CAPTCHA_TYPES.NUMBER) {
            loadNumberCaptcha();
        }

        bindEvents();
        isInitialized = true;
    } catch (error) {
        console.error('Failed to initialize captcha:', error);
        handleCaptchaError(error);
    }
}

/**
 * Get current captcha type from form
 * @returns {number} Captcha type value
 * @private
 */
function getCaptchaType() {
    const captchaTypeElement = jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.CAPTCHA_TYPE);
    
    if (captchaTypeElement.length === 0) {
        throw new Error('Captcha type element not found');
    }

    const value = captchaTypeElement.val();
    const parsedValue = parseInt(value, 10);
    
    if (isNaN(parsedValue)) {
        throw new Error(`Invalid captcha type value: ${value}`);
    }

    return parsedValue;
}

/**
 * Get language code from form
 * @returns {string} Language code
 * @private
 */
function getLanguageCode() {
    const languageElement = jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.LANGUAGE_CODE);
    
    if (languageElement.length === 0) {
        console.warn('Language code element not found, using default');
        return 'en'; // Default fallback
    }

    const languageCode = languageElement.val();
    return languageCode || 'en'; // Fallback to 'en' if empty
}

/**
 * Bind event handlers
 * @private
 */
function bindEvents() {
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.TOKEN_BOX).off('click.captcha').on('click.captcha', function() {
        try {
            loadNumberCaptcha();
        } catch (error) {
            console.error('Error refreshing captcha:', error);
            handleCaptchaError(error);
        }
    });
}

/**
 * Load number captcha from API
 * @private
 */
function loadNumberCaptcha() {
    const $isSuccessfulElement = jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.ISSUCCESSFUL);
    const isSuccessfulValue = $isSuccessfulElement.val();
    if (isSuccessfulValue !== "true") {

        clearRefreshTimeout();

        // Get language code from form
        const langCode = getLanguageCode();

        jquery__WEBPACK_IMPORTED_MODULE_0___default().ajax({
            url: CAPTCHA_CONFIG.API_ENDPOINTS.NUMBER_CAPTCHA,
            method: 'POST',
            dataType: 'json',
            timeout: 10000,
            data: {
                'userLang': langCode
            }
        })
            .done(function (response) {
                handleNumberCaptchaSuccess(response);
            })
            .fail(function (xhr, status, error) {
                handleNumberCaptchaError(xhr, status, error);
            });
    }
}

/**
 * Handle successful number captcha response
 * @param {Object} response - API response
 * @private
 */
function handleNumberCaptchaSuccess(response) {
    try {
        if (!response || !response.data) {
            throw new Error('Invalid response structure');
        }

        const { picture, seconds } = response.data;
        
        if (!picture || typeof picture !== 'string') {
            throw new Error('Invalid picture data');
        }

        if (!seconds || typeof seconds !== 'number' || seconds <= 0) {
            throw new Error('Invalid refresh interval');
        }

        // Update captcha image
        const tokenBox = jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.TOKEN_BOX);
        if (tokenBox.length === 0) {
            throw new Error('Token box element not found');
        }

        tokenBox.attr('src', `data:image/png;base64,${picture}`);

        tokenBox.css('display', 'block');
        // Schedule next refresh
        const refreshInterval = Math.min(seconds * 1000, CAPTCHA_CONFIG.TIMEOUTS.DEFAULT_REFRESH);
        refreshTimeout = setTimeout(loadNumberCaptcha, refreshInterval);

        console.log('Number captcha loaded successfully');
    } catch (error) {
        console.error('Error processing number captcha response:', error);
        scheduleRetry();
    }
}

/**
 * Handle number captcha error
 * @param {Object} xhr - XMLHttpRequest object
 * @param {string} status - Request status
 * @param {string} error - Error message
 * @private
 */
function handleNumberCaptchaError(xhr, status, error) {
    console.error('Number captcha request failed:', {
        status: status,
        error: error,
        statusCode: xhr?.status,
        responseText: xhr?.responseText
    });
    
    scheduleRetry();
}

/**
 * Schedule retry for failed captcha requests
 * @private
 */
function scheduleRetry() {
    clearRefreshTimeout();
    refreshTimeout = setTimeout(loadNumberCaptcha, CAPTCHA_CONFIG.TIMEOUTS.RETRY_DELAY);
}

/**
 * Clear refresh timeout
 * @private
 */
function clearRefreshTimeout() {
    if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        refreshTimeout = null;
    }
}

/**
 * Handle general captcha errors
 * @param {Error} error - Error object
 * @private
 */
function handleCaptchaError(error) {
    console.error('Captcha error:', error.message);
    // Could implement additional error handling here (e.g., show user notification)
}

/**
 * Cleanup resources
 * @public
 */
function cleanup() {
    clearRefreshTimeout();
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.TOKEN_BOX).off('click.captcha');
    isInitialized = false;
}

// Global Turnstile callbacks
/**
 * Handle successful Turnstile verification
 * @param {string} token - Turnstile token
 * @global
 */
window.onTurnstileSuccess = function(token) {
    try {
        if (!token || typeof token !== 'string') {
            throw new Error('Invalid Turnstile token');
        }

        console.log('Turnstile verification successful');
        
        const recaptchaTokenField = jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.RECAPTCHA_TOKEN);
        if (recaptchaTokenField.length === 0) {
            throw new Error('ReCaptcha token field not found');
        }

        recaptchaTokenField.val(token);
        jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.NUMBER_CAPTCHA).hide();
        
    } catch (error) {
        console.error('Error handling Turnstile success:', error);
        handleTurnstileError('INVALID_TOKEN');
    }
};

/**
 * Handle Turnstile verification error
 * @param {string} errorCode - Error code from Turnstile
 * @global
 */
window.onTurnstileError = function(errorCode) {
    try {
        console.error('Turnstile verification failed:', errorCode);
        
        // Show number captcha as fallback
        jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.NUMBER_CAPTCHA).show();
        jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.RECAPTCHA_TOKEN).val('');
        jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.TURNSTILE_WIDGET).hide();
        
        // Reset captcha type to number captcha
        const captchaTypeField = jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.CAPTCHA_TYPE);
        if (captchaTypeField.length > 0) {
            captchaTypeField.val(CAPTCHA_CONFIG.CAPTCHA_TYPES.NUMBER);
        }
        
        // Remove Turnstile widget
        jquery__WEBPACK_IMPORTED_MODULE_0___default()(CAPTCHA_CONFIG.SELECTORS.TURNSTILE_WIDGET).remove();
        
        // Load number captcha
        loadNumberCaptcha();
        
    } catch (error) {
        console.error('Error handling Turnstile error:', error);
    }
};

/**
 * Handle Turnstile token expiration
 * @global
 */
window.onTurnstileExpired = function() {
    try {
        console.log('Turnstile token expired');
        
        if (typeof turnstile !== 'undefined' && turnstile.reset) {
            turnstile.reset();
        } else {
            console.warn('Turnstile object not available for reset');
        }
        
    } catch (error) {
        console.error('Error handling Turnstile expiration:', error);
    }
};

// Initialize when DOM is ready
jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).ready(function() {
    initializeCaptcha();
});

// Cleanup on page unload
jquery__WEBPACK_IMPORTED_MODULE_0___default()(window).on('beforeunload', function() {
    cleanup();
});

// Export for testing purposes
if ( true && module.exports) {
    module.exports = {
        initializeCaptcha,
        loadNumberCaptcha,
        cleanup,
        CAPTCHA_CONFIG
    };
}

/***/ }),

/***/ "./src/js/iConvert.ts":
/*!****************************!*\
  !*** ./src/js/iConvert.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   iConvertTracker: () => (/* binding */ iConvertTracker)
/* harmony export */ });
const iConvertTracker = ({ eventName, depositType, amount, currency, userName, eventValue, }) => {
    var _a, _b, _c, _d;
    switch (eventName) {
        case 'Purchase':
            if (depositType === 'StartTrial') {
                (_a = window.dataLayer) === null || _a === void 0 ? void 0 : _a.push({
                    event: 'iConvert-deposit-success',
                    depositValue: String(amount) || '0',
                    depositCurrency: currency || 'THB',
                    userID: userName,
                });
            }
            else if (depositType === 'redeposit') {
                (_b = window.dataLayer) === null || _b === void 0 ? void 0 : _b.push({
                    event: 'iConvert-deposit-success',
                    depositValue: String(amount) || '0',
                    depositCurrency: currency || 'THB',
                    userID: userName,
                });
            }
            break;
        case 'CompleteRegistration':
            (_c = window.dataLayer) === null || _c === void 0 ? void 0 : _c.push({
                event: 'iConvert-registration-success',
                userID: eventValue,
            });
            break;
        case 'Login':
            (_d = window.dataLayer) === null || _d === void 0 ? void 0 : _d.push({
                event: 'iConvert-login-success',
                userID: eventValue,
            });
            break;
        default:
        // Do nothing
    }
};


/***/ }),

/***/ "./src/js/metaPixel.ts":
/*!*****************************!*\
  !*** ./src/js/metaPixel.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MetaPixelTracker: () => (/* binding */ MetaPixelTracker)
/* harmony export */ });
/* unused harmony exports isSDKAvailable, setCookie, checkStatus */
// Standard Events enum
const StandardEvents = {
    CompleteRegistration: 'CompleteRegistration',
    Purchase: 'Purchase',
    StartTrial: 'StartTrial'
};
// Skip Events enum
const SkipEvents = {
    redeposit: 'redeposit',
    Purchase: 'Purchase',
    StartTrial: 'StartTrial'
};
// Check if Meta Pixel SDK is available
const isSDKAvailable = () => {
    return window.fbq !== undefined && typeof window.fbq === 'function';
};
// Meta Pixel Tracker function
const MetaPixelTracker = (eventName, currency, amount, eventValue) => {
    if (SkipEvents[eventName]) {
        return;
    }
    if (!isSDKAvailable()) {
        return;
    }
    const action = StandardEvents[eventName] ? 'track' : 'trackCustom';
    const params = {
        currency,
        value: amount
    };
    try {
        if (window.fbq) {
            window.fbq(action, eventName, params, { eventID: eventValue });
        }
    }
    catch (error) {
        // Error tracking Meta Pixel
    }
};
// Cookie helper function
const DEFAULT_COOKIE_DAYS = 7;
const setCookie = (name, value, days = DEFAULT_COOKIE_DAYS) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
};
// Check Meta Pixel status
const checkStatus = () => {
    if (isSDKAvailable() && window.fbq) {
        // Get pixel IDs
        try {
            const pixelIds = window.fbq.getState().pixels.map((pixel) => pixel.id).join(',');
            setCookie('pixelIds', pixelIds);
        }
        catch (error) {
            // Error getting pixel IDs
        }
    }
};
// Auto-check status on module load (with delay to ensure SDK is loaded)
const CHECK_STATUS_DELAY = 2000;
if (typeof window !== 'undefined') {
    setTimeout(checkStatus, CHECK_STATUS_DELAY);
    // Create backward compatibility namespace
    window.MetaPixel = {
        isSDKAvailable,
        metaPixelTracker: MetaPixelTracker,
        setCookie,
        checkStatus
    };
}


/***/ }),

/***/ "./src/js/operaPixel.ts":
/*!******************************!*\
  !*** ./src/js/operaPixel.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OperaPixelTracker: () => (/* binding */ OperaPixelTracker)
/* harmony export */ });
/* harmony import */ var _baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./baseTrackerEvent */ "./src/js/baseTrackerEvent.ts");

const OperaEventName = {
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.RegisterSubmit]: '',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.DepositSubmit]: 'deposit',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Purchase]: 'Purchase',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Withdraw]: 'withdraw',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.CompleteRegistration]: 'CompleteRegistration',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.StartTrial]: 'StartTrial',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Redeposit]: 'redeposit',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Login]: '',
};
// SDK check
const isSDKAvailable = (win = window) => (win === null || win === void 0 ? void 0 : win.otag) !== undefined && typeof win.otag === 'function';
const OperaPixelTracker = (eventName) => {
    var _a;
    if (!isSDKAvailable(window)) {
        return;
    }
    const eventToken = OperaEventName[eventName];
    if (!eventToken) {
        return;
    }
    (_a = window.otag) === null || _a === void 0 ? void 0 : _a.call(window, 'event', eventToken);
};


/***/ }),

/***/ "./src/js/site.js":
/*!************************!*\
  !*** ./src/js/site.js ***!
  \************************/
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.min.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var jquery_validation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery-validation */ "./node_modules/jquery-validation/dist/jquery.validate.js");
/* harmony import */ var jquery_validation__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery_validation__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var jquery_validation_unobtrusive__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jquery-validation-unobtrusive */ "./node_modules/jquery-validation-unobtrusive/dist/jquery.validate.unobtrusive.js");
/* harmony import */ var jquery_validation_unobtrusive__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jquery_validation_unobtrusive__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var libphonenumber_js_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! libphonenumber-js/core */ "./node_modules/libphonenumber-js/core/index.js");
/* harmony import */ var libphonenumber_js_metadata_mobile_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! libphonenumber-js/metadata.mobile.json */ "./node_modules/libphonenumber-js/metadata.mobile.json.js");
/* harmony import */ var _capcha_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./capcha.js */ "./src/js/capcha.js");
/* harmony import */ var _tracker__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./tracker */ "./src/js/tracker.ts");
/* module decorator */ module = __webpack_require__.hmd(module);
/**
 * Site JavaScript Module
 * Handles form validation, UI interactions, and user experience enhancements
 * @author Fanex Affiliate Team
 * @version 1.0.0
 */









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
    jquery__WEBPACK_IMPORTED_MODULE_0___default().validator.unobtrusive.adapters.add("phonenocountry", ["countryproperty"], function (options) {
        options.rules["phonenocountry"] = {
            countryProperty: options.params.countryproperty
        };
        options.messages["phonenocountry"] = options.message;
    });

    // Add phone validation method
    jquery__WEBPACK_IMPORTED_MODULE_0___default().validator.addMethod("phonenocountry", function (value, element, params) {
        if (!value) {
            return true;
        }

        try {
            const countryCodeFieldName = `${params.countryProperty}`;
            const countryCode = jquery__WEBPACK_IMPORTED_MODULE_0___default()(`[name='${countryCodeFieldName}']`).val();

            if (!countryCode) {
                return true;
            }

            const phoneNumber = (0,libphonenumber_js_core__WEBPACK_IMPORTED_MODULE_3__.parsePhoneNumberFromString)(value, countryCode, libphonenumber_js_metadata_mobile_json__WEBPACK_IMPORTED_MODULE_4__["default"]);
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
    const $isSuccessfulElement = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.ISSUCCESSFUL);
    const isSuccessfulValue = $isSuccessfulElement.val();

    if (isSuccessfulValue === "true") {
        const username = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.USERNAME_INPUT).val();
        (0,_tracker__WEBPACK_IMPORTED_MODULE_6__.tracking)({
           eventName: 'CompleteRegistration',
           eventValue: username
        });
        
        // Show the redirect overlay (HTML is already in the page)
        jquery__WEBPACK_IMPORTED_MODULE_0___default()('#redirect-overlay').show();
        // Prevent scrolling
        jquery__WEBPACK_IMPORTED_MODULE_0___default()('body').addClass('redirect-overlay-active');
        
        const redirectUrl = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.REDIRECTURL).val();
        if (redirectUrl) {
            setTimeout(function () {
                window.location.href = redirectUrl;
            }, 600);
        }
    }
}

function scrollToForm() {
    const $form = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.USERNAME_INPUT);
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
    const $form = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.REGISTER_FORM);

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

                const username = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.USERNAME_INPUT).val();
                (0,_tracker__WEBPACK_IMPORTED_MODULE_6__.tracking)({
                   eventName: 'registerSubmit',
                   eventValue: username
                });

                setTimeout(() => { this.submit(); }, 100);

                console.log('submit done');
            } else {
                // Scroll to first error after a short delay to allow validation to complete
                setTimeout(() => {
                    const $firstError = jquery__WEBPACK_IMPORTED_MODULE_0___default()('.input-validation-error').first();
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
    const $passwordInput = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.PASSWORD_INPUT);
    const $hiddenPassword = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.HIDDEN_PASSWORD);

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
    const $form = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.REGISTER_FORM);
    const validator = $form.data("validator");

    if (!validator) {
        return;
    }

    validator.settings.highlight = function (element) {
        jquery__WEBPACK_IMPORTED_MODULE_0___default()(element).closest(SITE_CONFIG.SELECTORS.INPUT_BOX)
            .removeClass(SITE_CONFIG.CLASSES.INPUT_VALID)
            .addClass(SITE_CONFIG.CLASSES.INPUT_ERROR);
    };

    validator.settings.unhighlight = function (element) {
        jquery__WEBPACK_IMPORTED_MODULE_0___default()(element).closest(SITE_CONFIG.SELECTORS.INPUT_BOX)
            .removeClass(SITE_CONFIG.CLASSES.INPUT_ERROR)
            .addClass(SITE_CONFIG.CLASSES.INPUT_VALID);
    };
}

/**
 * Handle initial validation errors
 * @private
 */
function handleInitialValidationErrors() {
    const $firstErrorField = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.INPUT_VALIDATION_ERROR).first();

    if ($firstErrorField.length > 0) {
        scrollToElement($firstErrorField, () => $firstErrorField.focus());
    } else {
        const $summary = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.VALIDATION_SUMMARY).first();
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

    jquery__WEBPACK_IMPORTED_MODULE_0___default()('html, body').animate({
        scrollTop: offset.top - SITE_CONFIG.SCROLL_THRESHOLDS.SCROLL_OFFSET
    }, SITE_CONFIG.TIMEOUTS.SCROLL_ANIMATION, callback);
}

/**
 * Initialize Go To Top button
 * @private
 */
function initializeGoTopButton() {
    const $goTopBtn = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.GO_TOP_BTN);

    if ($goTopBtn.length === 0) {
        return;
    }

    function toggleGoTopButton() {
        const scrollTop = jquery__WEBPACK_IMPORTED_MODULE_0___default()(window).scrollTop();
        const isVisible = scrollTop > SITE_CONFIG.SCROLL_THRESHOLDS.GO_TOP_VISIBILITY;

        $goTopBtn.css("display", isVisible ? "flex" : "none");
    }

    // Initial check
    toggleGoTopButton();

    // Bind scroll event
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(window).on("scroll.site", toggleGoTopButton);

    // Bind click event
    $goTopBtn.on("click.site", function () {
        jquery__WEBPACK_IMPORTED_MODULE_0___default()("html, body").animate({
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

    jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on("click.site", ICON_INFORMATION, function (e) {
        e.stopPropagation();
        const $current = jquery__WEBPACK_IMPORTED_MODULE_0___default()(this).closest(INPUT_FIELD).find(INPUT_INFO);
        jquery__WEBPACK_IMPORTED_MODULE_0___default()(INPUT_INFO).not($current).removeClass(ACTIVE);
        $current.toggleClass(ACTIVE);
    });

    jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on("click.site", function (e) {
        if (!jquery__WEBPACK_IMPORTED_MODULE_0___default()(e.target).is(ICON_INFORMATION) && !jquery__WEBPACK_IMPORTED_MODULE_0___default()(e.target).closest(INPUT_INFO).length) {
            jquery__WEBPACK_IMPORTED_MODULE_0___default()(INPUT_INFO).removeClass(ACTIVE);
        }
    });
}

/**
 * Initialize password visibility toggle
 * @private
 */
function initializePasswordToggle() {
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.INPUT_FIELD).each(function () {
        const $field = jquery__WEBPACK_IMPORTED_MODULE_0___default()(this);
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
    const $form = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.REGISTER_FORM);

    if ($form.length === 0) {
        return;
    }

    jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on("click.site", function (event) {
        const $target = jquery__WEBPACK_IMPORTED_MODULE_0___default()(event.target);
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
    const $containers = jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.SWIPER_CONTAINER);

    if ($containers.length === 0) {
        return;
    }

    // Use Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initializeSwiperForContainer(jquery__WEBPACK_IMPORTED_MODULE_0___default()(entry.target));
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
            initializeSwiperForContainer(jquery__WEBPACK_IMPORTED_MODULE_0___default()(this));
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
        const SwiperModule = await Promise.all(/*! import() */[__webpack_require__.e("swiper-node_modules_swiper_modules_a"), __webpack_require__.e("swiper-node_modules_swiper_sh")]).then(__webpack_require__.bind(__webpack_require__, /*! swiper/swiper-bundle.mjs */ "./node_modules/swiper/swiper-bundle.mjs"));
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

    (jquery__WEBPACK_IMPORTED_MODULE_0___default().validator).methods.remote = function (value, element, param) {
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

            currentXhr = jquery__WEBPACK_IMPORTED_MODULE_0___default().ajax(jquery__WEBPACK_IMPORTED_MODULE_0___default().extend(true, {
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
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(window).off("scroll.site");
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).off("click.site");
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.GO_TOP_BTN).off("click.site");
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(SITE_CONFIG.SELECTORS.INPUT_FIELD).find(SITE_CONFIG.SELECTORS.ICON_EYE + ', ' + SITE_CONFIG.SELECTORS.ICON_EYE_SLASH).off("click.site");

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
jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).ready(function () {
    initializeSite();
    
    // Check for validation summary errors (like captcha failures) after page load
    setTimeout(() => {
        const $validationSummary = jquery__WEBPACK_IMPORTED_MODULE_0___default()('.validation-summary-errors');
        if ($validationSummary.length > 0) {
            scrollToElement($validationSummary);
        }
    }, 100);
});


// Cleanup on page unload
jquery__WEBPACK_IMPORTED_MODULE_0___default()(window).on('beforeunload', function () {
    cleanup();
});

// Export for testing purposes
if ( true && module.exports) {
    module.exports = {
        initializeSite,
        cleanup,
        SITE_CONFIG
    };
}

/***/ }),

/***/ "./src/js/tracker.ts":
/*!***************************!*\
  !*** ./src/js/tracker.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   tracking: () => (/* binding */ tracking)
/* harmony export */ });
/* harmony import */ var _metaPixel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./metaPixel */ "./src/js/metaPixel.ts");
/* harmony import */ var _yuri__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./yuri */ "./src/js/yuri.ts");
/* harmony import */ var _adjust__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./adjust */ "./src/js/adjust.ts");
/* harmony import */ var _operaPixel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./operaPixel */ "./src/js/operaPixel.ts");
/* harmony import */ var _iConvert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./iConvert */ "./src/js/iConvert.ts");





const tracking = (trackerParams) => {
    const { eventName, eventValue, amount, currency } = trackerParams;
    // Make sure add error handling for each tracker
    const trackEvent = (name) => {
        try {
            (0,_operaPixel__WEBPACK_IMPORTED_MODULE_3__.OperaPixelTracker)(name);
        }
        catch (error) {
            // OperaPixelTracker error
        }
        try {
            (0,_metaPixel__WEBPACK_IMPORTED_MODULE_0__.MetaPixelTracker)(name, currency, amount, eventValue);
        }
        catch (error) {
            // MetaPixelTracker error
        }
        try {
            (0,_adjust__WEBPACK_IMPORTED_MODULE_2__.AdjustTracker)(name, currency, amount, {
                eventID: eventValue,
            });
        }
        catch (error) {
            // AdjustTracker error
        }
        try {
            (0,_yuri__WEBPACK_IMPORTED_MODULE_1__.YuriTracker)(name);
        }
        catch (error) {
            // YuriTracker error
        }
        try {
            (0,_iConvert__WEBPACK_IMPORTED_MODULE_4__.iConvertTracker)({ eventName, eventValue });
        }
        catch (error) {
        }
    };
    try {
        trackEvent(eventName);
    }
    catch (error) {
        // Tracking error
    }
};


/***/ }),

/***/ "./src/js/yuri.ts":
/*!************************!*\
  !*** ./src/js/yuri.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   YuriTracker: () => (/* binding */ YuriTracker)
/* harmony export */ });
/* harmony import */ var _baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./baseTrackerEvent */ "./src/js/baseTrackerEvent.ts");

const isSDKAvailable = (win = window) => 
// eslint-disable-next-line no-underscore-dangle
(win === null || win === void 0 ? void 0 : win._yuri_track) !== undefined && typeof win._yuri_track === 'function';
const YuriEventName = {
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.RegisterSubmit]: '', // empty string will return
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.DepositSubmit]: '',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Purchase]: 'Purchase',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Withdraw]: '',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.CompleteRegistration]: 'register',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.StartTrial]: '',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Redeposit]: '',
    [_baseTrackerEvent__WEBPACK_IMPORTED_MODULE_0__.BaseTrackerEvent.Login]: '',
};
const YuriTracker = (eventName) => {
    var _a;
    if (!isSDKAvailable(window)) {
        return;
    }
    const eventToken = YuriEventName[eventName];
    if (!eventToken) {
        return;
    }
    // eslint-disable-next-line no-underscore-dangle
    (_a = window._yuri_track) === null || _a === void 0 ? void 0 : _a.call(window, eventToken);
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "fanex-affiliate-landing-pages:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"site": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkfanex_affiliate_landing_pages"] = self["webpackChunkfanex_affiliate_landing_pages"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["jquery","libphonenumber-node_modules_libphonenumber-js_c","libphonenumber-node_modules_libphonenumber-js_es6_f","libphonenumber-node_modules_libphonenumber-js_e","vendor"], () => (__webpack_require__("./src/js/site.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=site.bundle.js.map