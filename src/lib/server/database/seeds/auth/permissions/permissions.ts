import { type DB } from '$lib/server/database';
import { permissions } from '$lib/server/database/schemas';
import { permissions as permissionsSeedConfig } from '$lib/server/database/seedConfig';

const initData = Object.values(permissionsSeedConfig);

/**
 * Inicializálja a jogosultságok táblát a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(permissions).values(initData);
}
