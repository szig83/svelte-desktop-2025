import { authForSeed as auth } from '$lib/auth/seed';
import { type DB } from '$lib/server/database';
import { type UserSchema, users, userGroups } from '$lib/server/database/schemas';
import { seedConfig } from '$lib/server/database/seedConfig';
import { eq } from 'drizzle-orm';

import { faker } from '@faker-js/faker';

type mockUser = Omit<Extract<UserSchema, { mode: 'signUp' }>, 'mode'>;

/**
 * Véletlenszerű nevekkel, jelszavakkal és e-mail címekkel rendelkező mock felhasználók listáját generálja.
 *
 * @returns {mockUser[]} Mock felhasználói objektumok tömbje.
 */
const mock = (): mockUser[] => {
	const data: mockUser[] = [];

	for (let i = 0; i < 10; i++) {
		// Default to 10 mock users
		data.push({
			name: faker.person.fullName(),
			password: faker.internet.password({ memorable: true, length: 10 }),
			email: faker.internet.email()
		});
	}

	return data;
};

/**
 * Ellenőrzötté tesz egy felhasználót és hozzárendeli egy csoporthoz.
 *
 * @param db - Az adatbázis példány.
 * @param userId - A frissítendő felhasználó azonosítója.
 * @param groupId - A csoport azonosítója, amelyhez a felhasználót hozzá kell rendelni.
 */
const updateUserAndAssignGroup = async (db: DB, userId: number, groupId: number) => {
	await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
	await db.insert(userGroups).values({
		userId,
		groupId
	});
};

/**
 * Létrehoz egy rendszergazda felhasználót és hozzárendeli a rendszergazda csoporthoz.
 *
 * @param auth - Az auth példány.
 * @param authInstance
 * @param db - Az adatbázis példány.
 *
 * @returns {Promise<{ user?: { id: string } }>} A signUpEmail hívás eredménye.
 */
const addSysAdmin = async (
	authInstance: typeof auth,
	db: DB
): Promise<{ user?: { id: string } }> => {
	const { user } = await auth.api.signUpEmail({
		body: {
			name: seedConfig.users.sysadmin.name,
			email: seedConfig.users.sysadmin.email,
			password: seedConfig.users.sysadmin.password
		}
	});

	if (user) {
		await updateUserAndAssignGroup(db, parseInt(user.id), seedConfig.users.sysadmin.groupId);
	}

	return { user };
};

/**
 * Létrehoz egy admin felhasználót és hozzárendeli az admin csoporthoz.
 *
 * @param auth - Az auth példány.
 * @param authInstance
 * @param db - Az adatbázis példány.
 *
 * @returns {Promise<{ user?: { id: string } }>} A signUpEmail hívás eredménye.
 */
const addAdmin = async (authInstance: typeof auth, db: DB): Promise<{ user?: { id: string } }> => {
	const { user } = await authInstance.api.signUpEmail({
		body: {
			name: seedConfig.users.admin.name,
			email: seedConfig.users.admin.email,
			password: seedConfig.users.admin.password
		}
	});

	if (user) {
		await updateUserAndAssignGroup(db, parseInt(user.id), seedConfig.users.admin.groupId);
	}

	return { user };
};

/**
 * Létrehoz egy tartalomszerkesztő felhasználót és hozzárendeli a tartalomszerkesztő csoporthoz.
 *
 * @param auth - Az auth példány.
 * @param authInstance
 * @param db - Az adatbázis példány.
 *
 * @returns {Promise<{ user?: { id: string } }>} A signUpEmail hívás eredménye.
 */
const addContentEditor = async (
	authInstance: typeof auth,
	db: DB
): Promise<{ user?: { id: string } }> => {
	const { user } = await authInstance.api.signUpEmail({
		body: {
			name: seedConfig.users.content_editor.name,
			email: seedConfig.users.content_editor.email,
			password: seedConfig.users.content_editor.password
		}
	});

	if (user) {
		await updateUserAndAssignGroup(db, parseInt(user.id), seedConfig.users.content_editor.groupId);
	}

	return { user };
};

/**
 * Létrehoz egy nyilvános felhasználót és hozzárendeli a nyilvános felhasználói csoporthoz.
 *
 * @param auth - Az auth példány.
 * @param authInstance
 * @param db - Az adatbázis példány.
 * @param user - A létrehozandó mock felhasználó.
 *
 * @param mockUser
 * @returns {Promise<{ user?: { id: string } }>} A signUpEmail hívás eredménye.
 */
const addPublicUser = async (
	authInstance: typeof auth,
	db: DB,
	mockUser: mockUser
): Promise<{ user?: { id: string } }> => {
	const { user } = await authInstance.api.signUpEmail({
		body: mockUser
	});

	console.log(mockUser);

	if (user) {
		await updateUserAndAssignGroup(db, parseInt(user.id), seedConfig.users.public_user.groupId);
	}

	return { user };
};

/**
 * Feltölti az adatbázist felhasználókkal.
 *
 * A feltöltési folyamat a következőképpen működik:
 *  1. Létrehoz egy rendszergazda felhasználót és hozzárendeli a rendszergazda csoporthoz.
 *  2. Létrehoz egy admin felhasználót és hozzárendeli az admin csoporthoz.
 *  3. Létrehoz egy tartalomszerkesztő felhasználót és hozzárendeli a tartalomszerkesztő csoporthoz.
 *  4. Ha a darabszám nagyobb mint 0, létrehozza a megadott számú nyilvános felhasználót és hozzárendeli őket a nyilvános felhasználói csoporthoz.
 *
 * @param auth - Az auth példány.
 * @param authInstance
 * @param db - Az adatbázis példány.
 * @param publicUserCount - A létrehozandó nyilvános felhasználók száma.
 */
export async function seed(authInstance: typeof auth, db: DB, publicUserCount: number = 0) {
	const sysAdminUser = await addSysAdmin(authInstance, db);

	if (sysAdminUser.user) {
		await addAdmin(authInstance, db);
		await addContentEditor(authInstance, db);

		if (publicUserCount > 0) {
			const mockUsers = mock();
			for (const user of mockUsers) {
				await addPublicUser(authInstance, db, user);
			}
		}
	}
}
