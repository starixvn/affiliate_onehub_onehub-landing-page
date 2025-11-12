import { BaseTrackerEvent } from './baseTrackerEvent';

const OperaEventName: Record<string, string> = {
	[BaseTrackerEvent.RegisterSubmit]: '',
	[BaseTrackerEvent.DepositSubmit]: 'deposit',
	[BaseTrackerEvent.Purchase]: 'Purchase',
	[BaseTrackerEvent.Withdraw]: 'withdraw',
	[BaseTrackerEvent.CompleteRegistration]: 'CompleteRegistration',
	[BaseTrackerEvent.StartTrial]: 'StartTrial',
	[BaseTrackerEvent.Redeposit]: 'redeposit',
	[BaseTrackerEvent.Login]: '',
}

// SDK check
const isSDKAvailable = (win: Window = window): boolean =>
	win?.otag !== undefined && typeof win.otag === 'function'

export const OperaPixelTracker = (eventName: string): void => {
	if (!isSDKAvailable(window)) {
		return;
	}

	const eventToken = OperaEventName[eventName];
	if (!eventToken) {
		return;
	}

	window.otag?.('event', eventToken);
}
