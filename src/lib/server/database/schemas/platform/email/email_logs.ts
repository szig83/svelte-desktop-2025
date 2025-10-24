import { uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';

export const emailLogs = schema.table(
	'email_logs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		messageId: varchar('message_id', { length: 255 }),
		recipient: varchar('recipient', { length: 255 }).notNull(),
		subject: varchar('subject', { length: 500 }).notNull(),
		templateType: varchar('template_type', { length: 100 }),
		status: varchar('status', { length: 50 }).notNull(),
		errorMessage: text('error_message'),
		sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
		deliveredAt: timestamp('delivered_at', { withTimezone: true }),
		openedAt: timestamp('opened_at', { withTimezone: true }),
		clickedAt: timestamp('clicked_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	(table) => ({
		// Performance optimization indexes
		recipientIdx: index('email_logs_recipient_idx').on(table.recipient),
		statusIdx: index('email_logs_status_idx').on(table.status),
		createdAtIdx: index('email_logs_created_at_idx').on(table.createdAt),
		messageIdIdx: index('email_logs_message_id_idx').on(table.messageId),
		// Composite index for common queries
		recipientStatusIdx: index('email_logs_recipient_status_idx').on(table.recipient, table.status),
		statusCreatedAtIdx: index('email_logs_status_created_at_idx').on(table.status, table.createdAt)
	})
);
