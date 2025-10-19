import { timestamp, text, uuid } from 'drizzle-orm/pg-core'
import { authSchema as schema } from './_schema'

const verifications = schema.table('verifications', {
	id: uuid('id').defaultRandom().primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at'),
})

export default verifications
