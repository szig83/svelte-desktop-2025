import { sql } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';

import db from '$lib/server/database';
import * as schema from '$lib/server/database/schemas';
import * as seeds from '$lib/server/database/seeds';
import { authForSeed as auth } from '$lib/auth/seed';
import * as path from 'path';
import * as fs from 'fs';

type SeedOptions = {
	tableReset: boolean;
	dropStoredProcedures: boolean;
	storedProcedures: boolean;
	publicUserCount: number;
};

const seedOptions: SeedOptions = {
	tableReset: true,
	dropStoredProcedures: true,
	storedProcedures: true,
	publicUserCount: 5
};

/**
 *
 */
function getSchemaTableNames(): string[] {
	// Összegyűjti az összes tábla objektumot a sémából
	const allTables = Object.values(schema).filter((obj) => {
		const isObject = typeof obj === 'object' && obj !== null;
		if (!isObject) return false;

		// Szűrés a Drizzle táblákra az IsDrizzleTable szimbólum alapján
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (obj as any)[Symbol.for('drizzle:IsDrizzleTable')] === true;
	});

	// Lekérdezi a táblák neveit (opcionális)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const allTableNames = allTables.map((table) => getTableConfig(table as any).name);

	return allTableNames;
}

/**
 * Kiüríti az összes táblát fordított függőségi sorrendben.
 */
async function resetTables() {
	// Az összes tábla kiürítése fordított függőségi sorrendben
	const tablesToReset = [
		// Kapcsolótáblák (junction tables) - először ezeket kell törölni
		schema.userRoles,
		schema.rolePermissions,
		schema.groupPermissions,
		schema.userGroups,

		// Autentikációs táblák
		schema.verifications,
		schema.sessions,
		schema.accounts,

		// Audit táblák
		schema.auditLogs,

		// Entitás táblák
		schema.users,
		schema.permissions,
		schema.roles,
		schema.groups,
		schema.resources,
		schema.providers,

		schema.emailLogs,
		schema.emailTemplates,
		schema.userSettings
	];

	const schemaTables = getSchemaTableNames();

	console.log('[Táblák kiürítése]');
	for (const table of tablesToReset) {
		await db.execute(sql`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
		const tableConfig = getTableConfig(table);

		// Eltávolítjuk a kiürített táblát a schemaTables listából
		const index = schemaTables.indexOf(tableConfig.name);
		if (index > -1) {
			schemaTables.splice(index, 1);
		}

		console.log(` - ${tableConfig.name} sikeresen kiürítve`);
	}

	if (schemaTables.length > 0) {
		console.log(
			'🔴 A következő táblák hiányoznak a kiürítési folyamatból:',
			schemaTables.join(', ')
		);
		console.log('🟡 Táblák részegesen kiürítve\n');
	} else {
		console.log('🟢 Táblák sikeresen kiürítve\n');
	}
}

/**
 * Kiindulási tábla adatok betöltése.
 */
async function seedTableData() {
	// Seed adatok betöltése a függőségi sorrend figyelembevételével

	console.log('[Tábla adatok betöltése]');

	// 1. Alap entitások (nincs külső kulcs függőségük)
	console.log(' - Alapentitások betöltése...');
	await seeds.resources(db); // Erőforrások
	await seeds.providers(db); // Hitelesítési szolgáltatók
	await seeds.groups(db); // Csoportok
	await seeds.roles(db); // Szerepkörök

	// 2. Jogosultságok (függenek az erőforrásoktól)
	console.log(' - Jogosultságok betöltése...');
	await seeds.permissions(db); // Jogosultságok

	// 3. Kapcsolatok az entitások között
	console.log(' - Entitás kapcsolatok betöltése...');
	await seeds.rolePermissions(db); // Szerepkör-jogosultság kapcsolatok
	await seeds.groupPermissions(db); // Csoport-jogosultság kapcsolatok

	// 4. Felhasználók és kapcsolataik
	/*	console.log(' - Felhasználók és kapcsolataik betöltése...');
	await seeds.users(auth, db, seedOptions.publicUserCount); // Felhasználók
	await seeds.userRoles(db); // Felhasználó-szerepkör kapcsolatok
	console.log('🟢 Minden tábla adat sikeresen betöltve\n');
*/
}

/**
 * Törli az összes tárolt eljárást és függvényt az adatbázisból.
 */
async function dropStoredProcedures() {
	console.log('[Tárolt eljárások és függvények törlése]');

	// Lekérdezzük az összes függvényt és eljárást az adatbázisból
	const proceduresResult = await db.execute(sql`
		SELECT
			n.nspname as schema_name,
			p.proname as function_name,
			pg_get_function_identity_arguments(p.oid) as function_args
		FROM pg_proc p
		LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
		WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
		AND n.nspname NOT LIKE 'pg_temp_%'
		AND n.nspname NOT LIKE 'pg_toast_temp_%'
		ORDER BY n.nspname, p.proname
	`);

	const procedures = proceduresResult.rows || proceduresResult;

	if (!procedures || procedures.length === 0) {
		console.log(' - Nincs törölhető tárolt eljárás vagy függvény');
		console.log('🟢 Tárolt eljárások törlése befejezve\n');
		return;
	}

	// Töröljük az összes talált függvényt/eljárást
	for (const procedure of procedures) {
		const schemaName = procedure.schema_name;
		const functionName = procedure.function_name;
		const functionArgs = procedure.function_args;

		try {
			await db.execute(
				sql.raw(
					`DROP FUNCTION IF EXISTS "${schemaName}"."${functionName}"(${functionArgs}) CASCADE`
				)
			);
			console.log(` - ${schemaName}.${functionName}(${functionArgs}) sikeresen törölve`);
		} catch (error) {
			console.log(` - Hiba a ${schemaName}.${functionName}(${functionArgs}) törlése során:`, error);
		}
	}

	console.log('🟢 Minden tárolt eljárás és függvény sikeresen törölve\n');
}

/**
 * Betölti a tárolt eljárásokat.
 */
async function seedStoredProcedures() {
	console.log('[Tárolt eljárások betöltése]');
	const proceduresDir = path.join(__dirname, 'procedures');
	// Recursive function to find all SQL files in a directory and its subdirectories
	/**
	 *
	 * @param dir
	 */
	function findSqlFiles(dir: string): string[] {
		let sqlFiles: string[] = [];
		const items = fs.readdirSync(dir);

		for (const item of items) {
			const itemPath = path.join(dir, item);
			const stats = fs.statSync(itemPath);

			if (stats.isDirectory()) {
				// If directory, recursively search inside it
				sqlFiles = sqlFiles.concat(findSqlFiles(itemPath));
			} else if (stats.isFile() && item.endsWith('.sql')) {
				// If SQL file, add to the list
				sqlFiles.push(itemPath);
			}
		}

		return sqlFiles;
	}

	const sqlFilePaths = findSqlFiles(proceduresDir);

	for (const filePath of sqlFilePaths) {
		const procedureSQL = fs.readFileSync(filePath, 'utf8');
		await db.execute(sql.raw(procedureSQL));
		console.log(` - hozzáadás a(z) ${path.relative(proceduresDir, filePath)} fájlból`);
	}
	console.log('🟢 Minden tárolt eljárás sikeresen betöltve\n');
}

/**
 * Seed adatok betöltése.
 */
async function main() {
	// Táblák kiürítése
	if (seedOptions.tableReset) {
		await resetTables();
	}

	// Tárolt eljárások törlése
	if (seedOptions.dropStoredProcedures) {
		await dropStoredProcedures();
	}

	// Kiindulási tábla adatok betöltése
	await seedTableData();

	// Tárolt eljárások betöltése
	if (seedOptions.storedProcedures) {
		await seedStoredProcedures();
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		console.log('👌 Minden seed adat sikeresen betöltve!');
		process.exit(0);
	});
