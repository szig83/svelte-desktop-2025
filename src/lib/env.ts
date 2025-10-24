import * as v from 'valibot';

const envSchema = v.object({
	NODE_ENV: v.picklist(['development', 'production']),
	DB_HOST: v.string(),
	DB_USER: v.string(),
	DB_PASSWORD: v.string(),
	DB_NAME: v.string(),
	DB_PORT: v.pipe(v.string(), v.transform(Number)),
	DATABASE_URL: v.string(),
	DB_MIGRATING: v.optional(
		v.pipe(
			v.string(),
			v.check((s) => s === 'true' || s === 'false'),
			v.transform((s) => s === 'true')
		)
	),
	GOOGLE_CLIENT_ID: v.optional(v.string()),
	GOOGLE_CLIENT_SECRET: v.optional(v.string()),
	BETTER_AUTH_SECRET: v.optional(v.string()),
	BETTER_AUTH_URL: v.optional(v.string()),
	// Email service configuration
	EMAIL_PROVIDER: v.optional(v.picklist(['resend', 'sendgrid', 'smtp', 'ses']), 'resend'),

	// Resend configuration
	RESEND_API_KEY: v.optional(v.string()),
	RESEND_FROM_EMAIL: v.optional(v.string()),
	RESEND_VERIFIED_EMAIL: v.optional(v.string()),
	RESEND_WEBHOOK_SECRET: v.optional(v.string()),

	// SendGrid configuration
	SENDGRID_API_KEY: v.optional(v.string()),
	SENDGRID_FROM_EMAIL: v.optional(v.string()),

	// SMTP configuration
	SMTP_HOST: v.optional(v.string()),
	SMTP_PORT: v.optional(v.string()),
	SMTP_SECURE: v.optional(v.string()),
	SMTP_USERNAME: v.optional(v.string()),
	SMTP_PASSWORD: v.optional(v.string()),

	// AWS SES configuration
	AWS_REGION: v.optional(v.string()),
	AWS_ACCESS_KEY_ID: v.optional(v.string()),
	AWS_SECRET_ACCESS_KEY: v.optional(v.string()),
	EMAIL_TEST_MODE: v.optional(
		v.pipe(
			v.string(),
			v.transform((s) => s === 'true')
		)
	),
	EMAIL_LOG_LEVEL: v.optional(v.picklist(['debug', 'info', 'warn', 'error']))
});

// Típus generálása a schemából
type Env = v.InferOutput<typeof envSchema>;

/**
 * Provider-specifikus validáció.
 * @param {Env} env - Validált environment változók.
 */
function validateProviderSpecificEnv(env: Env): void {
	const provider = env.EMAIL_PROVIDER || 'resend';
	const errors: string[] = [];

	switch (provider) {
		case 'resend':
			if (!env.RESEND_API_KEY) {
				errors.push('RESEND_API_KEY is required when EMAIL_PROVIDER=resend');
			}
			if (!env.RESEND_FROM_EMAIL) {
				errors.push('RESEND_FROM_EMAIL is required when EMAIL_PROVIDER=resend');
			}
			// API key format ellenőrzés
			if (env.RESEND_API_KEY && !env.RESEND_API_KEY.startsWith('re_')) {
				errors.push('RESEND_API_KEY must start with "re_"');
			}
			break;

		case 'smtp':
			if (!env.SMTP_HOST) {
				errors.push('SMTP_HOST is required when EMAIL_PROVIDER=smtp');
			}
			if (!env.SMTP_PORT) {
				errors.push('SMTP_PORT is required when EMAIL_PROVIDER=smtp');
			}
			if (!env.SMTP_USERNAME) {
				errors.push('SMTP_USERNAME is required when EMAIL_PROVIDER=smtp');
			}
			if (!env.SMTP_PASSWORD) {
				errors.push('SMTP_PASSWORD is required when EMAIL_PROVIDER=smtp');
			}
			// Port szám ellenőrzés
			if (env.SMTP_PORT) {
				const port = parseInt(env.SMTP_PORT);
				if (isNaN(port) || port < 1 || port > 65535) {
					errors.push('SMTP_PORT must be a valid port number (1-65535)');
				}
			}
			// SMTP_SECURE ellenőrzés
			if (env.SMTP_SECURE && !['true', 'false'].includes(env.SMTP_SECURE)) {
				errors.push('SMTP_SECURE must be "true" or "false"');
			}
			break;

		case 'sendgrid':
			if (!env.SENDGRID_API_KEY) {
				errors.push('SENDGRID_API_KEY is required when EMAIL_PROVIDER=sendgrid');
			}
			if (!env.SENDGRID_FROM_EMAIL) {
				errors.push('SENDGRID_FROM_EMAIL is required when EMAIL_PROVIDER=sendgrid');
			}
			// API key format ellenőrzés
			if (env.SENDGRID_API_KEY && !env.SENDGRID_API_KEY.startsWith('SG.')) {
				errors.push('SENDGRID_API_KEY must start with "SG."');
			}
			break;

		case 'ses':
			if (!env.AWS_REGION) {
				errors.push('AWS_REGION is required when EMAIL_PROVIDER=ses');
			}
			if (!env.AWS_ACCESS_KEY_ID) {
				errors.push('AWS_ACCESS_KEY_ID is required when EMAIL_PROVIDER=ses');
			}
			if (!env.AWS_SECRET_ACCESS_KEY) {
				errors.push('AWS_SECRET_ACCESS_KEY is required when EMAIL_PROVIDER=ses');
			}
			break;

		default:
			errors.push(`Unknown EMAIL_PROVIDER: ${provider}`);
			break;
	}

	if (errors.length > 0) {
		throw new Error(`Email provider configuration errors:\n${errors.join('\n')}`);
	}
}

/**
 * Env változók validálása.
 * @returns {Env} Validált env változók.
 */
function validateEnv(): Env {
	try {
		const env = v.parse(envSchema, {
			NODE_ENV: process.env.NODE_ENV,
			DB_HOST: process.env.DB_HOST,
			DB_USER: process.env.DB_USER,
			DB_PASSWORD: process.env.DB_PASSWORD,
			DB_NAME: process.env.DB_NAME,
			DB_PORT: process.env.DB_PORT,
			DATABASE_URL: process.env.DATABASE_URL,
			DB_MIGRATING: process.env.DB_MIGRATING,
			GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
			BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
			BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
			EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
			RESEND_API_KEY: process.env.RESEND_API_KEY,
			RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
			RESEND_VERIFIED_EMAIL: process.env.RESEND_VERIFIED_EMAIL,
			RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
			SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
			SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
			SMTP_HOST: process.env.SMTP_HOST,
			SMTP_PORT: process.env.SMTP_PORT,
			SMTP_SECURE: process.env.SMTP_SECURE,
			SMTP_USERNAME: process.env.SMTP_USERNAME,
			SMTP_PASSWORD: process.env.SMTP_PASSWORD,
			AWS_REGION: process.env.AWS_REGION,
			AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
			AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
			EMAIL_TEST_MODE: process.env.EMAIL_TEST_MODE,
			EMAIL_LOG_LEVEL: process.env.EMAIL_LOG_LEVEL
		});

		// Provider-specifikus validáció
		validateProviderSpecificEnv(env);

		return env;
	} catch (error) {
		if (v.isValiError(error)) {
			const issues = v.flatten(error.issues).nested
				? Object.entries(v.flatten(error.issues).nested!)
						.map(([key, messages]) => `${key}: ${messages?.join(', ')}`)
						.join('\n')
				: 'Unknown validation error';
			throw new Error(`Invalid environment variables:\n${issues}`);
		}
		throw error;
	}
}

// Használat
export const env = validateEnv();
