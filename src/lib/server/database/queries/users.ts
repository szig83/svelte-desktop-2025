import db from '$lib/server/database';
import { eq } from 'drizzle-orm';
import { users } from '$lib/server/database/schemas';

const usersList = await db.query.users.findMany();

const getUserData = async (id: number) => await db.select().from(users).where(eq(users.id, id));

export { usersList, getUserData };
