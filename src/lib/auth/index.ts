import { betterAuth } from 'better-auth';
import db from '$lib/server/database';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '$lib/server/database/schemas/index';
import { config } from '$lib/config';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { eq } from 'drizzle-orm';
import { customSession } from 'better-auth/plugins';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			...schema
		},
		//debugLogs: true,
		usePlural: true
	}),
	account: {
		modelName: 'account',
		fields: {
			accountId: 'providerAccountId'
		}
	},
	advanced: {
		database: {
			generateId: false
		},
		cookiePrefix: config.SESSION_COOKIE_PREFIX
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		disableSignUp: true
	},
	socialProviders: {
		google: {
			accessType: 'offline',
			prompt: 'select_account consent',
			clientId: config.GOOGLE_CLIENT_ID as string,
			clientSecret: config.GOOGLE_CLIENT_SECRET as string
		}
	},
	databaseHooks: {
		session: {
			create: {
				before: async (session) => {
					/** Mielott letrejon az uj session, toroljuk a felhasznalo meglevo sessionjeit.
					 * Ez megakadalyozza, hogy parhuzamosan be legyen jelentkezve.
					 */
					await db
						.delete(schema.sessions)
						.where(eq(schema.sessions.userId, parseInt(session.userId)));
				}
			}
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent),
		customSession(async ({ user, session }) => {
			const roles = {
				admin: false,
				user: false
			};
			/*const x = await db
				.select()
				.from(schema.users)
				.where(eq(schema.users.id, parseInt(user.id)));
			console.log('x', x);*/
			return {
				roles,
				user: {
					...user,
					newField: 'newField'
				},
				session
			};
		})
	] // make sure this is the last plugin in the array
});
