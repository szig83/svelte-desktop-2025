import { type DB } from '@/database'
import { userRoles } from '@/database/schemas'
import { userRoles as userRolesSeedConfig } from '@/database/seedConfig'

/**
 * Inicializálja a felhasználó-szerepkör kapcsolatokat a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(userRoles).values(userRolesSeedConfig)
}
