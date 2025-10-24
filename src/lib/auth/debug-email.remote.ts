import { query } from '$app/server';
import { getEmailManager } from '$lib/server/utils';
import { env } from '$lib/env';

/**
 * Debug function to check email configuration
 */
export const getEmailConfig = query(async () => {
	const emailManager = getEmailManager();

	return {
		environmentVariables: {
			EMAIL_PROVIDER: env.EMAIL_PROVIDER,
			EMAIL_TEST_MODE: env.EMAIL_TEST_MODE,
			NODE_ENV: env.NODE_ENV,
			RESEND_FROM_EMAIL: env.RESEND_FROM_EMAIL,
			EMAIL_LOG_LEVEL: env.EMAIL_LOG_LEVEL
		},
		emailManagerConfig: emailManager
			? {
					testMode: emailManager['config'].testMode,
					fromEmail: emailManager['config'].fromEmail,
					logLevel: emailManager['config'].logLevel,
					hasApiKey: !!emailManager['config'].apiKey
				}
			: null,
		emailServiceAvailable: !!emailManager
	};
});
