import { type DB } from '$lib/server/database';
import { userRoles } from '$lib/server/database/schemas';
import { userRoles as userRolesSeedConfig } from '$lib/server/database/seedConfig';

/**
 * Inicializálja a felhasználó-szerepkör kapcsolatokat a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(userRoles).values(userRolesSeedConfig);
}
