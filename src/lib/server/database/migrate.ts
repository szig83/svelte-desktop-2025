import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import config from '../../../../drizzle.config.js';
import { env } from '../../env';
import * as schema from './schemas/index.js';

if (!env.DB_MIGRATING) {
	throw new Error('You must set DB_MIGRATING to true.');
}

console.log('Migrating...');

// Saját db kapcsolat létrehozása a migrációhoz
const pool = new Pool({
	connectionString: env.DATABASE_URL,
	max: 1
});

const db = drizzle(pool, { schema });

await migrate(db, { migrationsFolder: config.out! });

await pool.end();

console.log('Migration completed successfully!');
