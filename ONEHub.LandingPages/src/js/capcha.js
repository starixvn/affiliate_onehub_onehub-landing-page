/**
 * Captcha Management Module
 * Handles both number captcha and Turnstile captcha functionality
 * @author Fanex Affiliate Team
 * @version 1.0.0
 */

import $ from 'jquery';

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
    const captchaTypeElement = $(CAPTCHA_CONFIG.SELECTORS.CAPTCHA_TYPE);
    
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
    const languageElement = $(CAPTCHA_CONFIG.SELECTORS.LANGUAGE_CODE);
    
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
    $(CAPTCHA_CONFIG.SELECTORS.TOKEN_BOX).off('click.captcha').on('click.captcha', function() {
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
    const $isSuccessfulElement = $(CAPTCHA_CONFIG.SELECTORS.ISSUCCESSFUL);
    const isSuccessfulValue = $isSuccessfulElement.val();
    if (isSuccessfulValue !== "true") {

        clearRefreshTimeout();

        // Get language code from form
        const langCode = getLanguageCode();

        $.ajax({
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
        const tokenBox = $(CAPTCHA_CONFIG.SELECTORS.TOKEN_BOX);
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
    $(CAPTCHA_CONFIG.SELECTORS.TOKEN_BOX).off('click.captcha');
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
        
        const recaptchaTokenField = $(CAPTCHA_CONFIG.SELECTORS.RECAPTCHA_TOKEN);
        if (recaptchaTokenField.length === 0) {
            throw new Error('ReCaptcha token field not found');
        }

        recaptchaTokenField.val(token);
        $(CAPTCHA_CONFIG.SELECTORS.NUMBER_CAPTCHA).hide();
        
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
        $(CAPTCHA_CONFIG.SELECTORS.NUMBER_CAPTCHA).show();
        $(CAPTCHA_CONFIG.SELECTORS.RECAPTCHA_TOKEN).val('');
        $(CAPTCHA_CONFIG.SELECTORS.TURNSTILE_WIDGET).hide();
        
        // Reset captcha type to number captcha
        const captchaTypeField = $(CAPTCHA_CONFIG.SELECTORS.CAPTCHA_TYPE);
        if (captchaTypeField.length > 0) {
            captchaTypeField.val(CAPTCHA_CONFIG.CAPTCHA_TYPES.NUMBER);
        }
        
        // Remove Turnstile widget
        $(CAPTCHA_CONFIG.SELECTORS.TURNSTILE_WIDGET).remove();
        
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
$(document).ready(function() {
    initializeCaptcha();
});

// Cleanup on page unload
$(window).on('beforeunload', function() {
    cleanup();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCaptcha,
        loadNumberCaptcha,
        cleanup,
        CAPTCHA_CONFIG
    };
}