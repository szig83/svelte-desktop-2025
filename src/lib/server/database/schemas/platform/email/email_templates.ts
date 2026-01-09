import { uuid, varchar, text, jsonb, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';

export const emailTemplates = schema.table(
	'email_templates',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		type: varchar('template_type', { length: 100 }).notNull().unique(),
		name: varchar('name', { length: 255 }).notNull(),
		subjectTemplate: text('subject_template').notNull(),
		htmlTemplate: text('html_template').notNull(),
		textTemplate: text('text_template').notNull(),
		requiredData: jsonb('required_data').$type<string[]>().notNull().default([]),
		optionalData: jsonb('optional_data').$type<string[]>().default([]),
		isActive: boolean('is_active').default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	(table) => [
		index('email_templates_type_idx').on(table.type),
		index('email_templates_is_active_idx').on(table.isActive),
		index('email_templates_type_active_idx').on(table.type, table.isActive),
		index('email_templates_active_only_idx').on(table.type, table.updatedAt),
		index('email_templates_created_at_idx').on(table.createdAt),
		index('email_templates_updated_at_idx').on(table.updatedAt),
		index('email_templates_active_type_updated_idx').on(table.isActive, table.type, table.updatedAt)
	]
);
