import { BaseTrackerEvent } from './baseTrackerEvent';

const isSDKAvailable = (win: Window = window): boolean =>
	// eslint-disable-next-line no-underscore-dangle
	win?._yuri_track !== undefined && typeof win._yuri_track === 'function'

const YuriEventName: Record<string, string> = {
	[BaseTrackerEvent.RegisterSubmit]: '', // empty string will return
	[BaseTrackerEvent.DepositSubmit]: '',
	[BaseTrackerEvent.Purchase]: 'Purchase',
	[BaseTrackerEvent.Withdraw]: '',
	[BaseTrackerEvent.CompleteRegistration]: 'register',
	[BaseTrackerEvent.StartTrial]: '',
	[BaseTrackerEvent.Redeposit]: '',
	[BaseTrackerEvent.Login]: '',
};

export const YuriTracker = (eventName: string): void => {
	if (!isSDKAvailable(window)) {
		return;
	}

	const eventToken = YuriEventName[eventName];
	if (!eventToken) {
		return;
	}
	// eslint-disable-next-line no-underscore-dangle
	window._yuri_track?.(eventToken);
}
