import { env } from '$lib/env';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	return {
		registrationEnabled: env.REGISTRATION_ENABLED ?? false,
		socialLoginEnabled: env.SOCIAL_LOGIN_ENABLED ?? false,
		registered: url.searchParams.has('registered')
	};
};
