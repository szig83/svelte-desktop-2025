import { query } from '$app/server';
import { getNodemailer } from '$lib/server/email/providers/nodemailer-wrapper';

/**
 * Debug function to test nodemailer import
 */
export const debugNodemailer = query(async () => {
	try {
		console.log('Starting nodemailer debug...');

		const nodemailer = await getNodemailer();

		return {
			success: true,
			message: 'Nodemailer imported successfully',
			details: {
				hasCreateTransport: !!nodemailer.createTransport,
				type: typeof nodemailer,
				methods: Object.keys(nodemailer).filter((key) => typeof nodemailer[key] === 'function')
			}
		};
	} catch (error) {
		console.error('Nodemailer debug failed:', error);

		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			details:
				error instanceof Error
					? {
							name: error.name,
							message: error.message,
							stack: error.stack
						}
					: error
		};
	}
});
