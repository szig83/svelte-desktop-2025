import { betterAuth } from 'better-auth';
import db from '$lib/server/database';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '$lib/server/database/schemas/index';
import { config } from '@/lib/config';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			...schema
		},
		usePlural: true
	}),
	advanced: {
		generateId: false,
		cookiePrefix: config.SESSION_COOKIE_PREFIX
	},
	emailAndPassword: {
		enabled: true
	},
	socialProviders: {
		google: {
			clientId: config.GOOGLE_CLIENT_ID as string,
			clientSecret: config.GOOGLE_CLIENT_SECRET as string
		}
	},
	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					console.log(session);
				}
			}
		}
	}
});
