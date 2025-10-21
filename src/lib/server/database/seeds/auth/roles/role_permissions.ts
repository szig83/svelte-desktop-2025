import { type DB } from '@/database'
import { rolePermissions } from '@/database/schemas'
import { rolePermissions as rolePermissionsSeedConfig } from '@/database/seedConfig'

/**
 * Inicializálja a szerepkör-jogosultság kapcsolatokat a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(rolePermissions).values(rolePermissionsSeedConfig)
}
