import { query } from '$app/server';
import { Resend } from 'resend';
import { env } from '$lib/env';

/**
 * Test Resend API connectivity directly.
 */
export const testResendAPI = query(async () => {
	try {
		console.log('Testing Resend API with key:', env.RESEND_API_KEY?.substring(0, 10) + '...');

		const resend = new Resend(env.RESEND_API_KEY);

		// Try to send a simple test email to the verified email address
		const verifiedEmail = env.RESEND_VERIFIED_EMAIL || 'szigeti.developer@gmail.com';
		const result = await resend.emails.send({
			from: 'onboarding@resend.dev',
			to: [verifiedEmail], // Must use verified email address
			subject: 'API Test',
			text: 'This is a test email to verify API connectivity.'
		});

		console.log('Resend API response:', result);

		if (result.error) {
			return {
				success: false,
				error: result.error.message,
				details: result.error
			};
		}

		return {
			success: true,
			messageId: result.data?.id,
			message: 'Resend API is working correctly'
		};
	} catch (error) {
		console.error('Resend API test error:', error);

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
