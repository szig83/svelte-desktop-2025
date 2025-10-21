import { type DB } from '@/database'
import { groupPermissions } from '@/database/schemas'
import { groupPermissions as groupPermissionsSeedConfig } from '@/database/seedConfig'

/**
 * Inicializálja a csoport-jogosultság kapcsolatokat a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(groupPermissions).values(groupPermissionsSeedConfig)
}
