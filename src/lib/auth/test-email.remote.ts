import { command } from '$app/server';
import { getEmailManager } from '$lib/server/utils';
import { EmailTemplateType } from '$lib/server/email/types';
import { validateEmailRecipient } from '$lib/server/email/validation';
import * as v from 'valibot';

// Test email schema
const testEmailSchema = v.object({
	email: v.pipe(v.string(), v.email('Invalid email address')),
	name: v.optional(v.string(), 'Test User')
});

/**
 * Sends a test welcome email - only for testing purposes
 */
export const sendTestEmail = command(testEmailSchema, async ({ email, name }) => {
	// Validate email recipient first
	const validation = validateEmailRecipient(email);
	if (!validation.valid) {
		throw new Error(
			validation.reason + (validation.suggestion ? ` Suggestion: ${validation.suggestion}` : '')
		);
	}

	// Get email manager instance
	const emailManager = getEmailManager();

	// Check if email service is available
	if (!emailManager) {
		console.error('Email service not available');
		throw new Error('Email service is currently unavailable');
	}

	console.log('Sending test email to:', email);
	console.log('Email manager config:', emailManager['config']);

	// Prepare template data for welcome email
	const templateData = {
		name,
		email,
		appName: 'Desktop Environment (TEST)',
		dashboardUrl: '/admin',
		userId: 'test-user-id'
	};

	// Send welcome email using template
	const result = await emailManager.sendTemplatedEmail({
		to: email,
		template: EmailTemplateType.WELCOME,
		data: templateData
	});

	if (result.success) {
		console.log(`Test email sent successfully to ${email}`, {
			messageId: result.messageId
		});

		return {
			success: true,
			messageId: result.messageId,
			message: 'Test email sent successfully',
			config: {
				testMode: emailManager['config'].testMode,
				fromEmail: emailManager['config'].fromEmail
			}
		};
	} else {
		console.error(`Failed to send test email to ${email}:`, result.error);
		throw new Error(result.error || 'Failed to send test email');
	}
});
