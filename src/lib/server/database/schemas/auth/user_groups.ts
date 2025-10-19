import { timestamp, varchar, uuid } from 'drizzle-orm/pg-core'
import { authSchema as schema } from './_schema'

const userGroups = schema.table('user_groups', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name'),
	createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
})

export default userGroups
