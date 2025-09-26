import { query } from '$app/server';

export const getTest = query(async () => {
	await new Promise((resolve) => setTimeout(resolve, 2000));
	return { test: 'tesztelek de nagyon' };
});
