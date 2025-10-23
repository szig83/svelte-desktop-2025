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
	BETTER_AUTH_URL: v.optional(v.string())
});

// Típus generálása a schemából
type Env = v.InferOutput<typeof envSchema>;

/**
 * Env változók validálása.
 * @returns {Env} Validált env változók.
 */
function validateEnv(): Env {
	try {
		return v.parse(envSchema, {
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
			BETTER_AUTH_URL: process.env.BETTER_AUTH_URL
		});
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
