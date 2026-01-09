import { relations } from 'drizzle-orm';

// Import all tables
import { users } from './users/users';
import { accounts } from './authentication/accounts';
import { providers } from './authentication/providers';
import { sessions } from './authentication/sessions';
import { verifications } from './authentication/verifications';
import { groups } from './groups/groups';
import { userGroups } from './groups/user_groups';
import { groupPermissions } from './groups/group_permissions';
import { permissions } from './permissions/permissions';
import { resources } from './permissions/resources';
import { roles } from './roles/roles';
import { userRoles } from './roles/user_roles';
import { rolePermissions } from './roles/role_permissions';
import { auditLogs } from './audit/audit_logs';

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	userGroups: many(userGroups),
	userRoles: many(userRoles),
	auditLogs: many(auditLogs),
	verifications: many(verifications)
}));

// Accounts relations
export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
	provider: one(providers, {
		fields: [accounts.providerId],
		references: [providers.id]
	})
}));

// Providers relations
export const providersRelations = relations(providers, ({ many }) => ({
	accounts: many(accounts)
}));

// Sessions relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

// Groups relations
export const groupsRelations = relations(groups, ({ many }) => ({
	userGroups: many(userGroups),
	groupPermissions: many(groupPermissions)
}));

// User Groups relations
export const userGroupsRelations = relations(userGroups, ({ one }) => ({
	user: one(users, {
		fields: [userGroups.userId],
		references: [users.id]
	}),
	group: one(groups, {
		fields: [userGroups.groupId],
		references: [groups.id]
	})
}));

// Group Permissions relations
export const groupPermissionsRelations = relations(groupPermissions, ({ one }) => ({
	group: one(groups, {
		fields: [groupPermissions.groupId],
		references: [groups.id]
	}),
	permission: one(permissions, {
		fields: [groupPermissions.permissionId],
		references: [permissions.id]
	})
}));

// Permissions relations
export const permissionsRelations = relations(permissions, ({ one, many }) => ({
	resource: one(resources, {
		fields: [permissions.resourceId],
		references: [resources.id]
	}),
	rolePermissions: many(rolePermissions),
	groupPermissions: many(groupPermissions)
}));

// Resources relations
export const resourcesRelations = relations(resources, ({ many }) => ({
	permissions: many(permissions)
}));

// Roles relations
export const rolesRelations = relations(roles, ({ many }) => ({
	userRoles: many(userRoles),
	rolePermissions: many(rolePermissions)
}));

// User Roles relations
export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id]
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	})
}));

// Role Permissions relations
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	})
}));

// Audit Logs relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	})
}));
