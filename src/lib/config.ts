import { env } from '$lib/env';

const app_config = {
	SESSION_COOKIE_PREFIX: 'app'
};

export const config = { ...env, ...app_config };
