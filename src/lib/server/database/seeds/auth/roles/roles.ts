import { type DB } from '@/database'
import { roles } from '@/database/schemas'
import { roles as rolesSeedConfig } from '@/database/seedConfig'

const initData = Object.values(rolesSeedConfig)

/**
 * Inicializálja a szerepkörök táblát a seedConfig-ban megadott adatokkal.
 *
 * @param db Az adatbázis példány.
 */
export async function seed(db: DB) {
	await db.insert(roles).values(initData)
}
