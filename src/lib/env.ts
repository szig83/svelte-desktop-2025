import * as v from 'valibot';
import { env as envDynamic } from '$env/dynamic/private';
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
			NODE_ENV: envDynamic.NODE_ENV,
			DB_HOST: envDynamic.DB_HOST,
			DB_USER: envDynamic.DB_USER,
			DB_PASSWORD: envDynamic.DB_PASSWORD,
			DB_NAME: envDynamic.DB_NAME,
			DB_PORT: envDynamic.DB_PORT,
			DATABASE_URL: envDynamic.DATABASE_URL,
			DB_MIGRATING: envDynamic.DB_MIGRATING,
			GOOGLE_CLIENT_ID: envDynamic.GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET: envDynamic.GOOGLE_CLIENT_SECRET,
			BETTER_AUTH_SECRET: envDynamic.BETTER_AUTH_SECRET,
			BETTER_AUTH_URL: envDynamic.BETTER_AUTH_URL
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
