import { BaseTrackerEvent } from './baseTrackerEvent';

const ADJUST_EVENT_TOKENS: Record<string, string> = {
	[BaseTrackerEvent.Purchase]: 'c82gz0',
	[BaseTrackerEvent.DepositSubmit]: 'z7faop',
	[BaseTrackerEvent.StartTrial]: 'id0tst',
	[BaseTrackerEvent.Redeposit]: 'fnqjas',
	[BaseTrackerEvent.CompleteRegistration]: 'bzd00u',
	[BaseTrackerEvent.RegisterSubmit]: '7o95q5',
	[BaseTrackerEvent.Withdraw]: 'ryscb2',
	[BaseTrackerEvent.Login]: '',
};

const PUBLIC_ADJUST_TOKEN = 'e8xoahfuzqbk';

// Helper to check if string is empty
const isEmpty = (str: string): boolean => !str || str.trim().length === 0;

// Adjust SDK
const isSDKAvailable = (win: Window = window): boolean =>
	!isEmpty(PUBLIC_ADJUST_TOKEN) &&
	win?.Adjust !== undefined &&
	typeof win?.Adjust.initSdk === 'function' &&
	typeof win?.Adjust.trackEvent === 'function';

interface PartnerParam {
	key: string;
	value: string | number;
}

export const AdjustTracker = (
	eventName: string,
	currency?: string,
	revenue?: number,
	eventParams?: Record<string, string | number>
): void => {
	if (!isSDKAvailable(window) || !ADJUST_EVENT_TOKENS) {
		return;
	}

	const eventToken = ADJUST_EVENT_TOKENS[eventName];
	if (!eventToken) {
		return;
	}

	const createPartnerParams = (
		params: Record<string, string | number>
	): PartnerParam[] => {
		const entries: PartnerParam[] = [];
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

	window.Adjust?.trackEvent({
		eventToken,
		...(currency && { currency }),
		...(revenue && { revenue }),
		...(partnerParams && { partnerParams }),
	});
}
