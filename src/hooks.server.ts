import { redirect, type Handle } from '@sveltejs/kit';
import { auth } from '$lib/auth/index';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { initializeEmailService } from '$lib/server/email';

// Initialize email service on server startup
let emailServiceInitialized = false;

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize email service once on first request
	if (!emailServiceInitialized && !building) {
		try {
			const emailState = await initializeEmailService();
			if (emailState.degraded) {
				console.warn('[Server] Email service initialized in degraded mode:', emailState.error);
			} else if (emailState.initialized) {
				console.info('[Server] Email service initialized successfully');
			} else {
				console.error('[Server] Email service failed to initialize:', emailState.error);
			}
		} catch (error) {
			console.error('[Server] Email service initialization error:', error);
		}
		emailServiceInitialized = true;
	}

	console.log(event.route.id);
	if (event.route.id?.startsWith('/admin/(protected)')) {
		event.locals.settings = {
			windowPreview: true,
			screenshotThumbnailHeight: 200,
			preferPerformance: false,
			background: {
				type: 'video',
				value: 'bg-video.mp4'
			},
			taskbarPosition: 'bottom',
			theme: {
				mode: 'dark',
				modeTaskbarStartMenu: 'dark',
				colorPrimaryHue: '225',
				fontSize: 'medium'
			}
		};
		// Fetch current session from Better Auth
		const session = await auth.api.getSession({
			headers: event.request.headers
		});
		// Make session and user available on server
		if (session) {
			event.locals.session = session.session;
			event.locals.user = session.user;
			return svelteKitHandler({ event, resolve, auth, building });
		} else {
			return redirect(307, '/admin/sign-in');
		}
	} else {
		return svelteKitHandler({ event, resolve, auth, building });
	}
};
