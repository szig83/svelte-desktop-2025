import { redirect, type Handle } from '@sveltejs/kit';
import { auth } from '$lib/auth/index';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { userRepository } from '$lib/server/database/repositories';
import { initializeEmailService } from '$lib/server/email';

// Initialize email service on server startup
let emailServiceInitialized = false;

export const handle: Handle = async ({ event, resolve }) => {
	if (!emailServiceInitialized && !building) {
		try {
			// Enhanced initialization with migration and cache warm-up
			const emailState = await initializeEmailService({
				skipCacheWarmUp: false, // Warm up cache on startup
				validateConfiguration: true, // Validate configuration
				retryAttempts: 3,
				retryDelay: 1000
			});

			if (emailState.initialized) {
				if (emailState.degraded) {
					console.warn('[Server] Email service initialized in degraded mode');
				} else {
					console.info('[Server] Email service initialized successfully');
				}
			} else {
				console.error('[Server] Email service failed to initialize:', {
					error: emailState.error,
					healthStatus: emailState.healthStatus
				});
			}
		} catch (error) {
			console.error('[Server] Email service initialization error:', error);
		}
		emailServiceInitialized = true;
	}

	if (event.route.id?.startsWith('/admin/(protected)')) {
		// Fetch current session from Better Auth
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		// Make session and user available on server
		if (session) {
			event.locals.session = session.session;
			event.locals.user = session.user;

			// Betöltjük a beállításokat az adatbázisból
			const userId = parseInt(session.user.id);
			event.locals.settings = await userRepository.getUserSettings(userId);
			console.log(event.locals.settings);

			// Effektív téma mód kiszámítása (auto esetén a rendszer beállítás alapján)
			let effectiveMode = event.locals.settings.theme.mode;
			if (effectiveMode === 'auto') {
				// SSR esetén nem tudjuk a kliens rendszer beállítását, alapértelmezett: dark
				effectiveMode = 'dark';
			}
			return svelteKitHandler({
				event,
				resolve: (event) =>
					resolve(event, {
						transformPageChunk: ({ html }) => {
							// Téma osztály beillesztése a HTML-be
							return html.replace('#class-placeholder#', effectiveMode);
						}
					}),
				auth,
				building
			});
		} else {
			return redirect(307, '/admin/sign-in');
		}
	} else {
		return svelteKitHandler({
			event,
			resolve: (event) =>
				resolve(event, {
					transformPageChunk: ({ html }) => {
						// Ugyanaz a transzformáció a nem védett oldalakra is
						return html.replace('#class-placeholder#', 'new-text');
					}
				}),
			auth,
			building
		});
	}
};
