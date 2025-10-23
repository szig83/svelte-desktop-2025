import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../../env';

import * as schema from './schemas';

const pool = new Pool({
	connectionString: env.DATABASE_URL,
	max: env.DB_MIGRATING ? 1 : undefined
});

const db = drizzle(pool, {
	schema
});

export default db;
export { pool as client };
export type DB = typeof db;
