import { BaseTrackerEvent } from './baseTrackerEvent';
import { MetaPixelTracker } from './metaPixel'
import { YuriTracker } from './yuri'
import { AdjustTracker } from './adjust'
import { OperaPixelTracker } from './operaPixel'
import { iConvertTracker } from './iConvert'

// Type definitions
interface FBQPixel {
	id: string;
}

interface FBQState {
	pixels: FBQPixel[];
}

interface PartnerParam {
	key: string;
	value: string | number;
}

type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'assert';
type AdjustEnvironment = 'sandbox' | 'production';

// global.d.ts
declare global {
	interface Window {
		fbq?: {
			(action: string, ...args: unknown[]): void;
			getState: () => FBQState;
		};
		Adjust?: {
			initSdk: (config: {
				appToken: string;
				environment: AdjustEnvironment;
				logLevel?: LogLevel;
			}) => void;
			trackEvent: (params: {
				eventToken: string;
				currency?: string;
				revenue?: number;
				partnerParams?: PartnerParam[];
			}) => void;
		};
		AdjustInitialized?: boolean;
		otag?: (action: string, eventName: string) => void;
		_yuri_track?: (eventName: string) => void;
	}
}

type TTrackerParams = {
	eventName: BaseTrackerEvent | string;
	eventValue?: string;
	amount?: number;
	currency?: string;
	firstDeposit?: boolean;
	userName?: string;
}

export const tracking = (trackerParams: TTrackerParams): void => {
	const { eventName, eventValue, amount, currency } = trackerParams;
	
	// Make sure add error handling for each tracker
	const trackEvent = (name: string): void => {
		try {
			OperaPixelTracker(name);
		} catch (error) {
			// OperaPixelTracker error
		}

		try {
			MetaPixelTracker(name, currency, amount, eventValue);
		} catch (error) {
			// MetaPixelTracker error
		}

		try {
			AdjustTracker(name, currency, amount, {
				eventID: eventValue,
			});
		} catch (error) {
			// AdjustTracker error
		}

		try {
			YuriTracker(name);
		} catch (error) {
			// YuriTracker error
		}

		try {
			iConvertTracker({ eventName, eventValue });
		} catch (error) {
		}
	};

	try {
		trackEvent(eventName);
	} catch (error) {
		// Tracking error
	}
}

