import { query } from '$app/server';

/**
 * Test environment validation - shows current env status
 */
export const testEnvValidation = query(async () => {
	try {
		// Try to import env - this will trigger validation
		const { env } = await import('$lib/env');

		return {
			success: true,
			message: 'Environment validation passed',
			config: {
				EMAIL_PROVIDER: env.EMAIL_PROVIDER,
				NODE_ENV: env.NODE_ENV,
				// Provider-specific info (without sensitive data)
				providerConfig: getProviderConfigInfo(env)
			}
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown validation error',
			details:
				error instanceof Error
					? {
							name: error.name,
							message: error.message
						}
					: error
		};
	}
});

function getProviderConfigInfo(env: any) {
	const provider = env.EMAIL_PROVIDER || 'resend';

	switch (provider) {
		case 'resend':
			return {
				provider: 'resend',
				hasApiKey: !!env.RESEND_API_KEY,
				hasFromEmail: !!env.RESEND_FROM_EMAIL,
				hasVerifiedEmail: !!env.RESEND_VERIFIED_EMAIL,
				apiKeyFormat: env.RESEND_API_KEY
					? env.RESEND_API_KEY.startsWith('re_')
						? 'valid'
						: 'invalid'
					: 'missing'
			};

		case 'smtp':
			return {
				provider: 'smtp',
				hasHost: !!env.SMTP_HOST,
				hasPort: !!env.SMTP_PORT,
				hasUsername: !!env.SMTP_USERNAME,
				hasPassword: !!env.SMTP_PASSWORD,
				host: env.SMTP_HOST,
				port: env.SMTP_PORT,
				secure: env.SMTP_SECURE
			};

		case 'sendgrid':
			return {
				provider: 'sendgrid',
				hasApiKey: !!env.SENDGRID_API_KEY,
				hasFromEmail: !!env.SENDGRID_FROM_EMAIL,
				apiKeyFormat: env.SENDGRID_API_KEY
					? env.SENDGRID_API_KEY.startsWith('SG.')
						? 'valid'
						: 'invalid'
					: 'missing'
			};

		case 'ses':
			return {
				provider: 'ses',
				hasRegion: !!env.AWS_REGION,
				hasAccessKey: !!env.AWS_ACCESS_KEY_ID,
				hasSecretKey: !!env.AWS_SECRET_ACCESS_KEY,
				region: env.AWS_REGION
			};

		default:
			return {
				provider: 'unknown',
				error: `Unknown provider: ${provider}`
			};
	}
}
