import { serial, integer, varchar, text, timestamp, jsonb, inet } from 'drizzle-orm/pg-core';
import { relations as drizzleRelations } from 'drizzle-orm';
import { users } from '../../auth/users/users';
import { platformSchema as schema } from '../schema';

const userSettings = schema.table('user_settings', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.references(() => users.id)
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

const relations = drizzleRelations(userSettings, ({ one }) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	})
}));

export { userSettings, relations };
