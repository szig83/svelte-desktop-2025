import { query } from '$app/server';
import { SMTPClient } from '$lib/server/email/providers/smtp';
import { ProviderConfigBuilder } from '$lib/server/email/providers/factory';
import { env } from '$lib/env';

/**
 * Test SMTP connectivity directly
 */
export const testSMTPConnection = query(async () => {
	try {
		console.log('Testing SMTP connection...');

		const smtpConfig = ProviderConfigBuilder.buildSMTPConfig();
		console.log('SMTP Config:', {
			host: smtpConfig.host,
			port: smtpConfig.port,
			secure: smtpConfig.secure,
			username: smtpConfig.username,
			passwordSet: !!smtpConfig.password
		});

		const smtpClient = new SMTPClient(smtpConfig);

		// Test connection
		const isValid = await smtpClient.validateApiKey();

		if (!isValid) {
			return {
				success: false,
				error: 'SMTP connection validation failed',
				config: {
					host: smtpConfig.host,
					port: smtpConfig.port,
					username: smtpConfig.username
				}
			};
		}

		// Try to send a test email
		const testEmail = {
			from: smtpConfig.username,
			to: [env.RESEND_VERIFIED_EMAIL || 'szigeti.developer@gmail.com'],
			subject: 'SMTP Test Email',
			text: 'This is a test email sent via SMTP (Gmail).',
			html: '<p>This is a <strong>test email</strong> sent via SMTP (Gmail).</p>',
			reply_to: undefined,
			attachments: []
		};

		const result = await smtpClient.send(testEmail);

		// Close connection
		await smtpClient.close();

		return {
			success: true,
			messageId: result.id,
			message: 'SMTP email sent successfully',
			config: {
				host: smtpConfig.host,
				port: smtpConfig.port,
				username: smtpConfig.username,
				secure: smtpConfig.secure
			}
		};
	} catch (error) {
		console.error('SMTP test error:', error);

		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown SMTP error',
			details:
				error instanceof Error
					? {
							name: error.name,
							message: error.message,
							code: (error as any).code,
							command: (error as any).command
						}
					: error
		};
	}
});
