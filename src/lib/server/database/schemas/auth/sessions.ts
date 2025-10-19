import { timestamp, text, uuid } from 'drizzle-orm/pg-core'
import { authSchema as schema } from './_schema'
import { users } from './users'

const sessions = schema.table('sessions', {
	id: uuid('id').defaultRandom().primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
})

export default sessions
