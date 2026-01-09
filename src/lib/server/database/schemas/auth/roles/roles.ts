import { serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';

export const roles = schema.table('roles', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 50 }).notNull().unique(),
	description: text('description'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
