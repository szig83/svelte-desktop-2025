import { type DB } from '$lib/server/database';
import { roles } from '$lib/server/database/schemas';
import { roles as rolesSeedConfig } from '$lib/server/database/seedConfig';

const initData = Object.values(rolesSeedConfig);

/**
 * Inicializálja a szerepkörök táblát a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(roles).values(initData);
}
