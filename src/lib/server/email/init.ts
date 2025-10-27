import { env } from '$lib/env';
import { EmailManager } from './manager';
import { EmailLogger } from './logger';
import { createTemplateRegistry } from './templates';
import { EmailProviderFactory } from './providers/factory';
import type { EmailConfig } from './types';

/**
 * Email service initialization state.
 */
interface EmailServiceState {
	initialized: boolean;
	manager?: EmailManager;
	config?: EmailConfig;
	error?: string;
	degraded: boolean;
}

/**
 * Global email service state.
 */
let emailServiceState: EmailServiceState = {
	initialized: false,
	degraded: false
};

/**
 * Create email configuration from environment variables.
 * @returns {EmailConfig} Email configuration object.
 */
function createEmailConfig(): EmailConfig {
	const provider = env.EMAIL_PROVIDER || 'resend';

	// Base configuration
	const baseConfig = {
		testMode: env.EMAIL_TEST_MODE || false,
		logLevel: env.EMAIL_LOG_LEVEL || (env.NODE_ENV === 'development' ? 'debug' : 'info'),
		retryAttempts: 3,
		retryDelay: 1000
	};

	// Provider-specific configuration
	switch (provider) {
		case 'resend':
			return {
				...baseConfig,
				apiKey: env.RESEND_API_KEY || '',
				fromEmail: env.RESEND_FROM_EMAIL || '',
				webhookSecret: env.RESEND_WEBHOOK_SECRET
			};

		case 'smtp':
			return {
				...baseConfig,
				apiKey: '', // SMTP doesn't use API key
				fromEmail: env.SMTP_USERNAME || '',
				webhookSecret: undefined
			};

		default:
			throw new Error(`Unsupported email provider: ${provider}`);
	}
}

/**
 * Validate email configuration.
 * @param {EmailConfig} config Email configuration to validate.
 * @returns Validation result with errors if any.
 */
function validateEmailConfig(config: EmailConfig): { valid: boolean; errors: string[] } {
	const errors: string[] = [];
	const provider = env.EMAIL_PROVIDER || 'resend';

	// Provider-specific validation
	switch (provider) {
		case 'resend':
			if (!config.apiKey) {
				errors.push('RESEND_API_KEY is required');
			}
			if (config.apiKey && !config.apiKey.startsWith('re_')) {
				errors.push('RESEND_API_KEY appears to be invalid (should start with "re_")');
			}
			if (!config.fromEmail) {
				errors.push('RESEND_FROM_EMAIL is required');
			}
			break;

		case 'smtp':
			if (!env.SMTP_HOST) {
				errors.push('SMTP_HOST is required');
			}
			if (!env.SMTP_USERNAME) {
				errors.push('SMTP_USERNAME is required');
			}
			if (!env.SMTP_PASSWORD) {
				errors.push('SMTP_PASSWORD is required');
			}
			break;
	}

	// Common validation
	if (config.fromEmail && !isValidEmail(config.fromEmail)) {
		errors.push('FROM_EMAIL must be a valid email address');
	}

	// Validate log level
	const validLogLevels = ['debug', 'info', 'warn', 'error'];
	if (!validLogLevels.includes(config.logLevel)) {
		errors.push(`EMAIL_LOG_LEVEL must be one of: ${validLogLevels.join(', ')}`);
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Simple email validation.
 * @param {string} email Email address to validate.
 * @returns {boolean} True if email format is valid.
 */
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Initialize email service with graceful degradation.
 * @returns {Promise<EmailServiceState>} Promise resolving to email service state.
 */
export async function initializeEmailService(): Promise<EmailServiceState> {
	try {
		log('info', 'Initializing email service...');

		// Create configuration from environment
		const config = createEmailConfig();

		// Validate configuration
		const validation = validateEmailConfig(config);
		if (!validation.valid) {
			const errorMessage = `Email service configuration errors: ${validation.errors.join(', ')}`;
			log('error', errorMessage);

			// Return degraded state
			emailServiceState = {
				initialized: false,
				config,
				error: errorMessage,
				degraded: true
			};

			return emailServiceState;
		}

		// Create email service components
		const client = EmailProviderFactory.createConfiguredClient(config);
		const logger = new EmailLogger();
		const templateRegistry = createTemplateRegistry();
		const manager = new EmailManager(client, logger, templateRegistry, config);

		// Validate API connectivity (only in non-test mode)
		if (!config.testMode) {
			log('info', 'Validating API connectivity...');
			const isValidConnection = await manager.validateConfiguration();

			if (!isValidConnection) {
				const provider = env.EMAIL_PROVIDER || 'resend';
				const errorMessage = `Failed to validate ${provider} connection`;
				log('warn', `${errorMessage}, running in degraded mode`);

				// Return degraded state but still provide manager
				emailServiceState = {
					initialized: true,
					manager,
					config,
					error: errorMessage,
					degraded: true
				};

				return emailServiceState;
			}
		}

		// Success - fully initialized
		emailServiceState = {
			initialized: true,
			manager,
			config,
			degraded: false
		};

		log('info', `Email service initialized successfully (test mode: ${config.testMode})`);
		return emailServiceState;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
		log('error', `Email service initialization failed: ${errorMessage}`);

		// Return failed state
		emailServiceState = {
			initialized: false,
			error: errorMessage,
			degraded: true
		};

		return emailServiceState;
	}
}

/**
 * Get current email service state.
 * @returns Current email service state
 */
export function getEmailServiceState(): EmailServiceState {
	return { ...emailServiceState };
}

/**
 * Get email manager instance (with graceful degradation).
 * @returns Email manager instance or null if not available
 */
export function getEmailManager(): EmailManager | null {
	if (!emailServiceState.initialized || !emailServiceState.manager) {
		log('warn', 'Email manager requested but service not initialized');
		return null;
	}

	if (emailServiceState.degraded) {
		log('warn', 'Email manager running in degraded mode');
	}

	return emailServiceState.manager;
}

/**
 * Check if email service is available.
 * @returns True if email service is available
 */
export function isEmailServiceAvailable(): boolean {
	return emailServiceState.initialized && !!emailServiceState.manager;
}

/**
 * Check if email service is running in degraded mode.
 * @returns True if email service is degraded
 */
export function isEmailServiceDegraded(): boolean {
	return emailServiceState.degraded;
}

/**
 * Get email service health status.
 * @returns Detailed health status information
 */
export function getEmailServiceHealth(): {
	status: 'healthy' | 'degraded' | 'unavailable';
	initialized: boolean;
	testMode: boolean;
	error?: string;
	config?: {
		hasApiKey: boolean;
		hasFromEmail: boolean;
		hasWebhookSecret: boolean;
		logLevel: string;
	};
} {
	const state = emailServiceState;

	let status: 'healthy' | 'degraded' | 'unavailable';
	if (!state.initialized) {
		status = 'unavailable';
	} else if (state.degraded) {
		status = 'degraded';
	} else {
		status = 'healthy';
	}

	return {
		status,
		initialized: state.initialized,
		testMode: state.config?.testMode || false,
		error: state.error,
		config: state.config
			? {
					hasApiKey: !!state.config.apiKey,
					hasFromEmail: !!state.config.fromEmail,
					hasWebhookSecret: !!state.config.webhookSecret,
					logLevel: state.config.logLevel
				}
			: undefined
	};
}

/**
 * Reinitialize email service (useful for configuration changes).
 * @returns Promise resolving to new email service state
 */
export async function reinitializeEmailService(): Promise<EmailServiceState> {
	log('info', 'Reinitializing email service...');

	// Reset state
	emailServiceState = {
		initialized: false,
		degraded: false
	};

	return await initializeEmailService();
}

/**
 * Environment-specific configuration loading.
 * @returns Environment configuration with recommendations and warnings
 */
export function getEnvironmentSpecificConfig(): {
	environment: string;
	recommendations: string[];
	warnings: string[];
} {
	const environment = env.NODE_ENV;
	const recommendations: string[] = [];
	const warnings: string[] = [];

	switch (environment) {
		case 'development':
			recommendations.push('Consider enabling EMAIL_TEST_MODE=true for development');
			recommendations.push('Set EMAIL_LOG_LEVEL=debug for detailed logging');
			if (!env.EMAIL_TEST_MODE) {
				warnings.push('Test mode not enabled - emails will be sent to real addresses');
			}
			break;

		case 'production':
			recommendations.push('Ensure EMAIL_LOG_LEVEL is set to info or warn');
			recommendations.push('Configure RESEND_WEBHOOK_SECRET for delivery tracking');
			if (env.EMAIL_TEST_MODE) {
				warnings.push('Test mode is enabled in production - emails will not be delivered');
			}
			if (env.EMAIL_LOG_LEVEL === 'debug') {
				warnings.push('Debug logging enabled in production - consider changing to info');
			}
			break;

		default:
			recommendations.push('Verify environment-specific configuration');
	}

	return {
		environment,
		recommendations,
		warnings
	};
}

/**
 * Logging utility for initialization.
 * @param level Log level
 * @param message Log message
 */
function log(level: 'info' | 'warn' | 'error', message: string): void {
	const timestamp = new Date().toISOString();
	console[level](`[${timestamp}] [EmailService] ${message}`);
}
