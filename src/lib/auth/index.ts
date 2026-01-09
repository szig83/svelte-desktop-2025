import { betterAuth } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { baseAuthConfig, baseCustomSessionPlugin } from './config';

/**
 * SvelteKit-specifikus auth konfiguráció.
 * Ez tartalmazza a közös konfigurációt és a SvelteKit-specifikus pluginokat.
 */
export const auth = betterAuth({
	...baseAuthConfig,
	plugins: [sveltekitCookies(getRequestEvent), baseCustomSessionPlugin] // make sure this is the last plugin in the array
});
