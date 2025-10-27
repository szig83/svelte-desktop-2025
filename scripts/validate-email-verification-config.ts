#!/usr/bin/env bun

/**
 * Email Verification Configuration Validation Script
 *
 * This script validates the email verification configuration and provides
 * recommendations for optimal setup.
 */

import { config } from '../src/lib/config';
import { EmailManager } from '../src/lib/server/email/manager';
import { EmailTemplateType } from '../src/lib/server/email/types';

interface ValidationResult {
	category: string;
	status: 'success' | 'warning' | 'error';
	message: string;
	recommendation?: string;
}

class EmailVerificationConfigValidator {
	private results: ValidationResult[] = [];

	async validate(): Promise<ValidationResult[]> {
		console.log('🔍 Email Verification Configuration Validation\n');

		await this.validateEnvironmentVariables();
		await this.validateEmailProvider();
		await this.validateBetterAuthConfig();
		await this.validateSecuritySettings();
		await this.validateFeatureFlags();
		await this.validateEmailTemplates();
		await this.validateDatabaseConnection();

		return this.results;
	}

	private addResult(
		category: string,
		status: 'success' | 'warning' | 'error',
		message: string,
		recommendation?: string
	) {
		this.results.push({ category, status, message, recommendation });
	}

	private async validateEnvironmentVariables() {
		const category = 'Environment Variables';

		// Required variables
		const requiredVars = ['BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'EMAIL_PROVIDER'];

		for (const varName of requiredVars) {
			if (!config[varName as keyof typeof config]) {
				this.addResult(category, 'error', `Missing required variable: ${varName}`);
			} else {
				this.addResult(category, 'success', `${varName} is configured`);
			}
		}

		// Better Auth Secret validation
		if (config.BETTER_AUTH_SECRET) {
			if (config.BETTER_AUTH_SECRET.length < 32) {
				this.addResult(
					category,
					'error',
					'BETTER_AUTH_SECRET must be at least 32 characters',
					'Generate a secure secret: openssl rand -base64 32'
				);
			} else {
				this.addResult(category, 'success', 'BETTER_AUTH_SECRET has adequate length');
			}
		}

		// URL validation
		if (config.BETTER_AUTH_URL) {
			try {
				const url = new URL(config.BETTER_AUTH_URL);
				if (config.NODE_ENV === 'production' && url.protocol !== 'https:') {
					this.addResult(category, 'error', 'BETTER_AUTH_URL must use HTTPS in production');
				} else {
					this.addResult(category, 'success', 'BETTER_AUTH_URL is valid');
				}
			} catch {
				this.addResult(category, 'error', 'BETTER_AUTH_URL is not a valid URL');
			}
		}

		// Email verification specific variables
		if (config.REQUIRE_EMAIL_VERIFICATION) {
			this.addResult(category, 'success', 'Email verification is enabled');
		} else {
			this.addResult(
				category,
				'warning',
				'Email verification is disabled',
				'Set REQUIRE_EMAIL_VERIFICATION=true to enable'
			);
		}

		// Expiration time validation
		const expirationTime = config.EMAIL_VERIFICATION?.EXPIRES_IN || 86400;
		if (expirationTime > 604800) {
			// 7 days
			this.addResult(
				category,
				'warning',
				'Email verification expiration time is longer than 7 days',
				'Consider shorter expiration for better security'
			);
		} else if (expirationTime < 3600) {
			// 1 hour
			this.addResult(
				category,
				'warning',
				'Email verification expiration time is less than 1 hour',
				'Consider longer expiration for better user experience'
			);
		} else {
			this.addResult(
				category,
				'success',
				`Email verification expires in ${Math.round(expirationTime / 3600)} hours`
			);
		}
	}

	private async validateEmailProvider() {
		const category = 'Email Provider';
		const provider = config.EMAIL_PROVIDER;

		if (!provider) {
			this.addResult(category, 'error', 'No email provider configured');
			return;
		}

		this.addResult(category, 'success', `Using ${provider} as email provider`);

		// Provider-specific validation
		switch (provider) {
			case 'resend':
				await this.validateResendConfig();
				break;
			case 'smtp':
				await this.validateSMTPConfig();
				break;
			case 'sendgrid':
				await this.validateSendGridConfig();
				break;
			case 'ses':
				await this.validateSESConfig();
				break;
			default:
				this.addResult(category, 'error', `Unknown email provider: ${provider}`);
		}

		// Test email manager initialization
		try {
			const emailManager = new EmailManager();
			this.addResult(category, 'success', 'Email Manager initialized successfully');
		} catch (error) {
			this.addResult(
				category,
				'error',
				`Email Manager initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	private async validateResendConfig() {
		const category = 'Resend Configuration';

		if (!config.RESEND_API_KEY) {
			this.addResult(category, 'error', 'RESEND_API_KEY is required');
		} else if (!config.RESEND_API_KEY.startsWith('re_')) {
			this.addResult(category, 'error', 'RESEND_API_KEY must start with "re_"');
		} else {
			this.addResult(category, 'success', 'RESEND_API_KEY format is valid');
		}

		if (!config.RESEND_FROM_EMAIL) {
			this.addResult(category, 'error', 'RESEND_FROM_EMAIL is required');
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(config.RESEND_FROM_EMAIL)) {
				this.addResult(category, 'error', 'RESEND_FROM_EMAIL is not a valid email address');
			} else {
				this.addResult(category, 'success', 'RESEND_FROM_EMAIL format is valid');
			}
		}

		// Test API connection (if not in test mode)
		if (!config.EMAIL_TEST_MODE && config.RESEND_API_KEY) {
			try {
				const response = await fetch('https://api.resend.com/domains', {
					headers: {
						Authorization: `Bearer ${config.RESEND_API_KEY}`
					}
				});

				if (response.ok) {
					this.addResult(category, 'success', 'Resend API connection successful');
				} else {
					this.addResult(category, 'error', `Resend API connection failed: ${response.status}`);
				}
			} catch (error) {
				this.addResult(
					category,
					'warning',
					'Could not test Resend API connection',
					'Check your internet connection and API key'
				);
			}
		}
	}

	private async validateSMTPConfig() {
		const category = 'SMTP Configuration';

		const requiredFields = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD'];
		for (const field of requiredFields) {
			if (!config[field as keyof typeof config]) {
				this.addResult(category, 'error', `${field} is required for SMTP`);
			} else {
				this.addResult(category, 'success', `${field} is configured`);
			}
		}

		// Port validation
		if (config.SMTP_PORT) {
			const port = parseInt(config.SMTP_PORT);
			if (isNaN(port) || port < 1 || port > 65535) {
				this.addResult(category, 'error', 'SMTP_PORT must be a valid port number (1-65535)');
			} else {
				this.addResult(category, 'success', `SMTP port ${port} is valid`);
			}
		}

		// Security recommendations
		if (config.SMTP_PORT === '25') {
			this.addResult(
				category,
				'warning',
				'Port 25 is not recommended for SMTP',
				'Use port 587 (STARTTLS) or 465 (SSL/TLS)'
			);
		}

		if (config.SMTP_SECURE === 'false' && config.SMTP_PORT !== '587') {
			this.addResult(
				category,
				'warning',
				'Consider using STARTTLS (port 587) or SSL/TLS (port 465) for security'
			);
		}
	}

	private async validateSendGridConfig() {
		const category = 'SendGrid Configuration';

		if (!config.SENDGRID_API_KEY) {
			this.addResult(category, 'error', 'SENDGRID_API_KEY is required');
		} else if (!config.SENDGRID_API_KEY.startsWith('SG.')) {
			this.addResult(category, 'error', 'SENDGRID_API_KEY must start with "SG."');
		} else {
			this.addResult(category, 'success', 'SENDGRID_API_KEY format is valid');
		}

		if (!config.SENDGRID_FROM_EMAIL) {
			this.addResult(category, 'error', 'SENDGRID_FROM_EMAIL is required');
		} else {
			this.addResult(category, 'success', 'SENDGRID_FROM_EMAIL is configured');
		}
	}

	private async validateSESConfig() {
		const category = 'AWS SES Configuration';

		const requiredFields = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
		for (const field of requiredFields) {
			if (!config[field as keyof typeof config]) {
				this.addResult(category, 'error', `${field} is required for AWS SES`);
			} else {
				this.addResult(category, 'success', `${field} is configured`);
			}
		}
	}

	private async validateBetterAuthConfig() {
		const category = 'Better Auth Configuration';

		// Check if Better Auth is properly configured
		try {
			// Import and check auth configuration
			const { auth } = await import('../src/lib/auth/index.js');

			if (auth) {
				this.addResult(category, 'success', 'Better Auth is properly configured');
			} else {
				this.addResult(category, 'error', 'Better Auth configuration is invalid');
			}
		} catch (error) {
			this.addResult(
				category,
				'error',
				`Better Auth configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}

		// Validate email verification settings
		if (config.REQUIRE_EMAIL_VERIFICATION) {
			this.addResult(category, 'success', 'Email verification is required for new users');
		} else {
			this.addResult(
				category,
				'warning',
				'Email verification is not required',
				'Consider enabling for better security'
			);
		}

		if (config.AUTO_SIGNIN_AFTER_VERIFICATION) {
			this.addResult(
				category,
				'warning',
				'Auto sign-in after verification is enabled',
				'Consider disabling for better security'
			);
		} else {
			this.addResult(
				category,
				'success',
				'Auto sign-in after verification is disabled (recommended)'
			);
		}
	}

	private async validateSecuritySettings() {
		const category = 'Security Settings';

		// HTTPS in production
		if (config.NODE_ENV === 'production') {
			if (config.BETTER_AUTH_URL && !config.BETTER_AUTH_URL.startsWith('https://')) {
				this.addResult(category, 'error', 'HTTPS is required in production');
			} else {
				this.addResult(category, 'success', 'HTTPS is properly configured for production');
			}
		}

		// Rate limiting
		const rateLimits = config.RATE_LIMITS;
		if (rateLimits?.EMAIL_VERIFICATION?.MAX_ATTEMPTS) {
			if (rateLimits.EMAIL_VERIFICATION.MAX_ATTEMPTS > 10) {
				this.addResult(
					category,
					'warning',
					'Email verification rate limit is quite high',
					'Consider lowering for better security'
				);
			} else {
				this.addResult(
					category,
					'success',
					`Email verification rate limit: ${rateLimits.EMAIL_VERIFICATION.MAX_ATTEMPTS} attempts per window`
				);
			}
		}

		// Test mode in production
		if (config.NODE_ENV === 'production' && config.EMAIL_TEST_MODE) {
			this.addResult(category, 'error', 'EMAIL_TEST_MODE should be false in production');
		} else if (config.NODE_ENV === 'development' && !config.EMAIL_TEST_MODE) {
			this.addResult(
				category,
				'warning',
				'Consider enabling EMAIL_TEST_MODE in development',
				'Prevents sending real emails during development'
			);
		} else {
			this.addResult(category, 'success', 'Email test mode is properly configured');
		}
	}

	private async validateFeatureFlags() {
		const category = 'Feature Flags';

		const features = config.FEATURES;
		if (features?.EMAIL_VERIFICATION_ENABLED) {
			this.addResult(category, 'success', 'Email verification feature is enabled');
		} else {
			this.addResult(category, 'warning', 'Email verification feature is disabled');
		}

		if (features?.EMAIL_VERIFICATION_ROLLOUT_PERCENTAGE !== undefined) {
			const percentage = features.EMAIL_VERIFICATION_ROLLOUT_PERCENTAGE;
			if (percentage < 100) {
				this.addResult(
					category,
					'warning',
					`Email verification rollout is at ${percentage}%`,
					'Consider increasing to 100% when ready'
				);
			} else {
				this.addResult(category, 'success', 'Email verification is rolled out to 100% of users');
			}
		}

		if (features?.EMAIL_VERIFICATION_NEW_USERS_ONLY) {
			this.addResult(
				category,
				'warning',
				'Email verification only applies to new users',
				'Existing users may not have verified emails'
			);
		}
	}

	private async validateEmailTemplates() {
		const category = 'Email Templates';

		try {
			// Import email templates
			const { builtInTemplates } = await import('../src/lib/server/email/templates/built-in.js');

			if (builtInTemplates[EmailTemplateType.EMAIL_VERIFICATION]) {
				this.addResult(category, 'success', 'Email verification template is available');

				const template = builtInTemplates[EmailTemplateType.EMAIL_VERIFICATION];

				// Check required fields
				if (template.subject && template.htmlTemplate && template.textTemplate) {
					this.addResult(category, 'success', 'Email template has all required fields');
				} else {
					this.addResult(category, 'error', 'Email template is missing required fields');
				}

				// Check for required placeholders
				const requiredPlaceholders = [
					'{{verificationUrl}}',
					'{{name}}',
					'{{email}}',
					'{{appName}}'
				];
				const missingPlaceholders = requiredPlaceholders.filter(
					(placeholder) =>
						!template.htmlTemplate.includes(placeholder) ||
						!template.textTemplate.includes(placeholder)
				);

				if (missingPlaceholders.length === 0) {
					this.addResult(category, 'success', 'Email template contains all required placeholders');
				} else {
					this.addResult(
						category,
						'error',
						`Email template missing placeholders: ${missingPlaceholders.join(', ')}`
					);
				}
			} else {
				this.addResult(category, 'error', 'Email verification template is not found');
			}
		} catch (error) {
			this.addResult(
				category,
				'error',
				`Could not validate email templates: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	private async validateDatabaseConnection() {
		const category = 'Database Connection';

		try {
			// Import database
			const db = await import('../src/lib/server/database/index.js');

			if (db.default) {
				this.addResult(category, 'success', 'Database connection is available');

				// Test query to check verifications table
				try {
					const result = await db.default.execute('SELECT 1 FROM verifications LIMIT 1');
					this.addResult(category, 'success', 'Verifications table is accessible');
				} catch (error) {
					this.addResult(
						category,
						'warning',
						'Verifications table may not exist',
						'Run database migrations: bun db:migrate'
					);
				}
			} else {
				this.addResult(category, 'error', 'Database connection is not available');
			}
		} catch (error) {
			this.addResult(
				category,
				'error',
				`Database validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	printResults() {
		const grouped = this.results.reduce(
			(acc, result) => {
				if (!acc[result.category]) {
					acc[result.category] = [];
				}
				acc[result.category].push(result);
				return acc;
			},
			{} as Record<string, ValidationResult[]>
		);

		for (const [category, results] of Object.entries(grouped)) {
			console.log(`\n📋 ${category}`);
			console.log('─'.repeat(50));

			for (const result of results) {
				const icon = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
				console.log(`${icon} ${result.message}`);

				if (result.recommendation) {
					console.log(`   💡 ${result.recommendation}`);
				}
			}
		}

		// Summary
		const summary = this.results.reduce(
			(acc, result) => {
				acc[result.status]++;
				return acc;
			},
			{ success: 0, warning: 0, error: 0 }
		);

		console.log('\n📊 Summary');
		console.log('─'.repeat(50));
		console.log(`✅ Success: ${summary.success}`);
		console.log(`⚠️  Warnings: ${summary.warning}`);
		console.log(`❌ Errors: ${summary.error}`);

		if (summary.error > 0) {
			console.log('\n🚨 Please fix the errors before using email verification in production.');
			process.exit(1);
		} else if (summary.warning > 0) {
			console.log('\n⚠️  Please review the warnings for optimal configuration.');
		} else {
			console.log('\n🎉 Email verification is properly configured!');
		}
	}
}

// Run validation
async function main() {
	const validator = new EmailVerificationConfigValidator();
	await validator.validate();
	validator.printResults();
}

if (import.meta.main) {
	main().catch(console.error);
}

export { EmailVerificationConfigValidator };
