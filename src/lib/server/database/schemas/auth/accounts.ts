import { text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { authSchema as schema } from './_schema'
import { users } from './users'

const accounts = schema.table('accounts', {
	id: uuid('id').defaultRandom().primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
})

export default accounts
