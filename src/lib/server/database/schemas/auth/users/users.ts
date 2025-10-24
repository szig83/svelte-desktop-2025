import { varchar, boolean, timestamp, serial } from 'drizzle-orm/pg-core';
import { relations as drizzleRelations, type InferSelectModel } from 'drizzle-orm';
import { accounts } from '../authentication/accounts';
import { sessions } from '../authentication/sessions';
import { userGroups } from '../groups/user_groups';
import { userRoles } from '../roles/user_roles';
import { auditLogs } from '../audit/audit_logs';
import { verifications } from '../authentication/verifications';

import { authSchema as schema } from '../schema';

import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

const users = schema.table('users', {
	id: serial('id').primaryKey(),
	name: varchar('full_name', { length: 100 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	emailVerified: boolean('email_verified').default(false),
	username: varchar('username', { length: 50 }).unique(),
	image: varchar('image', { length: 255 }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
	deletedAt: timestamp('deleted_at', { withTimezone: true })
});

const relations = drizzleRelations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	userGroups: many(userGroups),
	userRoles: many(userRoles),
	auditLogs: many(auditLogs),
	verifications: many(verifications)
}));

// Define reusable field schemas
const emailSchema = v.pipe(v.string(), v.email(), v.minLength(5));
const nameSchema = v.pipe(v.string(), v.minLength(1));
const passwordSchema = v.pipe(v.string(), v.minLength(6));
const imageSchema = v.optional(v.string());
const idSchema = v.pipe(v.number(), v.minValue(1));

const baseSchema = createInsertSchema(users, {
	name: nameSchema,
	email: emailSchema,
	emailVerified: v.optional(v.boolean()),
	username: v.optional(v.string()),
	image: imageSchema
});

const userSchema = v.variant('mode', [
	v.object({
		mode: v.literal('signUp'),
		email: emailSchema,
		password: passwordSchema,
		name: nameSchema
	}),
	v.object({
		mode: v.literal('signIn'),
		email: emailSchema,
		password: passwordSchema
	}),
	v.object({
		mode: v.literal('update'),
		name: nameSchema,
		image: imageSchema,
		id: idSchema
	})
]);

export { users, relations as usersRelations, userSchema, baseSchema };
export type UserSchema = v.InferInput<typeof userSchema>;
export type UserSelectModel = InferSelectModel<typeof users>;
