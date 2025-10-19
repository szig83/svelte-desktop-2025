import { timestamp, uuid } from 'drizzle-orm/pg-core'
import { authSchema as schema } from './_schema'
import userGroups from './user_groups'
import { users } from './users'
import { relations as drizzleRelations } from 'drizzle-orm'

const userGroupMemberships = schema.table('user_group_memberships', {
	id: uuid('id').defaultRandom().primaryKey(),
	groupId: uuid('groupId')
		.notNull()
		.references(() => userGroups.id, { onDelete: 'cascade' }),
	userId: uuid('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
})

const relations = drizzleRelations(userGroupMemberships, ({ one }) => ({
	group: one(userGroups, {
		fields: [userGroupMemberships.groupId],
		references: [userGroups.id],
	}),
	user: one(users, {
		fields: [userGroupMemberships.userId],
		references: [users.id],
	}),
}))

export default userGroupMemberships
export { relations }
