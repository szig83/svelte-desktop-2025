import { serial, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations as drizzleRelations } from 'drizzle-orm';
import { users } from '../../auth/users/users';
import { platformSchema as schema } from '../schema';
import type { UserSettings } from '$lib/types/settings';

const userSettings = schema.table('user_settings', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	settings: jsonb('settings').$type<UserSettings>().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

const relations = drizzleRelations(userSettings, ({ one }) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	})
}));

export { userSettings, relations };
