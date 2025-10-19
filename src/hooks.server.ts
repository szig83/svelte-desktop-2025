import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

// Settings middleware
const settingsHandle: Handle = async ({ event, resolve }) => {
	event.locals.settings = {
		windowPreview: true,
		screenshotThumbnailHeight: 200,
		preferPerformance: false,
		background: {
			type: 'color',
			value: '#666666'
		},
		taskbarPosition: 'bottom',
		theme: {
			mode: 'light',
			modeTaskbarStartMenu: 'light',
			colorPrimaryHue: '225',
			fontSize: 'medium'
		}
	};

	return resolve(event);
};

// Custom headers middleware
const headersHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('x-custom-header', 'potato');
	return response;
};

// Better-auth middleware
const authHandle: Handle = (input) => {
	return svelteKitHandler({ ...input, auth, building });
};

// Chain all middlewares in order
export const handle = sequence(settingsHandle, authHandle, headersHandle);
