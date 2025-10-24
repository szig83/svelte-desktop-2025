import { type DB } from '$lib/server/database';
import { groupPermissions } from '$lib/server/database/schemas';
import { groupPermissions as groupPermissionsSeedConfig } from '$lib/server/database/seedConfig';

/**
 * Inicializálja a csoport-jogosultság kapcsolatokat a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(groupPermissions).values(groupPermissionsSeedConfig);
}
