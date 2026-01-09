import { type DB } from '$lib/server/database';
import { rolePermissions } from '$lib/server/database/schemas';
import { rolePermissions as rolePermissionsSeedConfig } from '$lib/server/database/seedConfig';

/**
 * Inicializálja a szerepkör-jogosultság kapcsolatokat a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(rolePermissions).values(rolePermissionsSeedConfig);
}
