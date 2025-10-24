import { jsonb, timestamp, serial } from 'drizzle-orm/pg-core';
import { relations as drizzleRelations, type InferSelectModel } from 'drizzle-orm';
import { userGroups } from './user_groups';
import { authSchema as schema } from '../schema';

import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';
import { localizedTextSchema, type LocalizedText } from '../../../../utils/index.js';

const groups = schema.table('groups', {
	id: serial('id').primaryKey(),
	name: jsonb('name').notNull().$type<LocalizedText>(), // Többnyelvű név
	description: jsonb('description').$type<Partial<LocalizedText>>(), // Opcionális többnyelvű leírás
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

const relations = drizzleRelations(groups, ({ many }) => ({
	userGroups: many(userGroups)
}));

const groupSchema = createInsertSchema(groups, {
	name: localizedTextSchema,
	description: v.optional(
		v.object({
			hu: v.optional(v.pipe(v.string(), v.minLength(1))),
			en: v.optional(v.pipe(v.string(), v.minLength(1)))
		})
	)
});

export { groups, relations as groupsRelations, groupSchema };
export type GroupSchema = v.InferInput<typeof groupSchema>;
export type GroupSelectModel = InferSelectModel<typeof groups>;
