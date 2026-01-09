import { relations } from 'drizzle-orm';

// Import platform tables
import { userSettings } from './settings/user_settings';

// Import auth tables for cross-schema relations
import { users } from '../auth/users/users';

// User Settings relations
export const userSettingsRelations = relations(userSettings, ({ one }) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	})
}));
