import { BaseTrackerEvent } from './baseTrackerEvent';
// Types
interface TrackerParams {
    eventName: BaseTrackerEvent | string;
    eventValue?: string;
    amount?: number;
    currency?: string;
    firstDeposit?: boolean;
    userName?: string;
}

// Standard Events enum
const StandardEvents: Record<string, string> = {
    CompleteRegistration: 'CompleteRegistration',
    Purchase: 'Purchase',
    StartTrial: 'StartTrial'
};

// Skip Events enum
const SkipEvents: Record<string, string> = {
    redeposit: 'redeposit',
    Purchase: 'Purchase',
    StartTrial: 'StartTrial'
};

// Check if Meta Pixel SDK is available
export const isSDKAvailable = (): boolean => {
    return window.fbq !== undefined && typeof window.fbq === 'function';
}

// Meta Pixel Tracker function
export const MetaPixelTracker = (
    eventName: BaseTrackerEvent | string,
    currency?: string,
    amount?: number,
    eventValue?: string
): void => {
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
    } catch (error) {
        // Error tracking Meta Pixel
    }
}

// Cookie helper function
const DEFAULT_COOKIE_DAYS = 7;
export const setCookie = (name: string, value: string, days = DEFAULT_COOKIE_DAYS): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
}

interface FBQPixel {
    id: string;
}

// Check Meta Pixel status
export const checkStatus = (): void => {
    if (isSDKAvailable() && window.fbq) {
        // Get pixel IDs
        try {
            const pixelIds = window.fbq.getState().pixels.map((pixel: FBQPixel) => pixel.id).join(',');
            setCookie('pixelIds', pixelIds);
        } catch (error) {
            // Error getting pixel IDs
        }
    }
}

// Auto-check status on module load (with delay to ensure SDK is loaded)
const CHECK_STATUS_DELAY = 2000;

interface MetaPixelNamespace {
    isSDKAvailable: typeof isSDKAvailable;
    metaPixelTracker: typeof MetaPixelTracker;
    setCookie: typeof setCookie;
    checkStatus: typeof checkStatus;
}

if (typeof window !== 'undefined') {
    setTimeout(checkStatus, CHECK_STATUS_DELAY);
    
    // Create backward compatibility namespace
    (window as Window & { MetaPixel?: MetaPixelNamespace }).MetaPixel = {
        isSDKAvailable,
        metaPixelTracker: MetaPixelTracker,
        setCookie,
        checkStatus
    };
}

