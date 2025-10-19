import { boolean, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { authSchema as schema } from './_schema'

export const users = schema.table('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name'),
	email: varchar('email').unique(),
	emailVerified: boolean('email_verified').notNull(),
	password: varchar('password'),
	image: varchar('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
})

export default users
