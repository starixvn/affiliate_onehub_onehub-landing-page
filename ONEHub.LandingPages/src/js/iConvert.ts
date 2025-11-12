declare global {
	interface Window {
		dataLayer: Record<string, unknown>[];
	}
}

interface IiConvertTrackerParams {
	eventName: string
	depositType?: 'StartTrial' | 'redeposit'
	amount?: number
	currency?: string
	userName?: string
	eventValue?: string
}

export const iConvertTracker = ({
	eventName,
	depositType,
	amount,
	currency,
	userName,
	eventValue,
}: IiConvertTrackerParams) => {
	switch (eventName) {
		case 'Purchase':
			if (depositType === 'StartTrial' || depositType === 'redeposit') {
				window.dataLayer?.push({
					event: 'iConvert-deposit-success',
					depositValue: String(amount) || '0',
					depositCurrency: currency || 'THB',
					userID: userName,
				});
			} 

			break;

		case 'CompleteRegistration':
			window.dataLayer?.push({
				event: 'iConvert-registration-success',
				userID: eventValue,
			});
			break;

		case 'Login':
			window.dataLayer?.push({
				event: 'iConvert-login-success',
				userID: eventValue,
			});
			break;

		default:
		// Do nothing
	}
}
