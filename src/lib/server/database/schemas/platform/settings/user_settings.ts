import { serial, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';
import { users } from '../../auth/users/users';
import type { UserSettings } from '$lib/types/settings';

export const userSettings = schema.table('user_settings', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	settings: jsonb('settings').$type<UserSettings>().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
