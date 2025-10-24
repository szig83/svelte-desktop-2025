import { env } from '$lib/env';
import { APP_CONSTANTS } from './constants.js';

const app_config = {
	SESSION_COOKIE_PREFIX: APP_CONSTANTS.SESSION_COOKIE_PREFIX
};

export const config = { ...env, ...app_config };
