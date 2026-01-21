import { redirect, type Handle } from '@sveltejs/kit';
import { auth } from '$lib/auth/index';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { initializeEmailService } from '$lib/server/email';

// Initialize email service on server startup
let emailServiceInitialized = false;

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize email service once on first request with enhanced configuration
	/*if (!emailServiceInitialized && !building) {
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
        */

	if (event.route.id?.startsWith('/admin/(protected)')) {
		// Betöltjük a beállításokat a cookie-ból, ha létezik
		const savedSettings = event.cookies.get('app.user_settings');
		const defaultSettings = {
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

		if (savedSettings) {
			try {
				event.locals.settings = JSON.parse(savedSettings);
			} catch {
				event.locals.settings = defaultSettings;
			}
		} else {
			event.locals.settings = defaultSettings;
		}
		// Fetch current session from Better Auth
		const session = await auth.api.getSession({
			headers: event.request.headers
		});
		// Make session and user available on server
		if (session) {
			event.locals.session = session.session;
			event.locals.user = session.user;
			return svelteKitHandler({
				event,
				resolve: (event) =>
					resolve(event, {
						transformPageChunk: ({ html }) => {
							// Itt cserélhetsz le vagy adhatsz hozzá bármit a HTML-hez
							// Például: meta tag hozzáadása, script injektálása, stb.
							return (
								html
									//.replace('</head>', '<meta name="custom" content="value" /></head>')
									.replace('#class-placeholder#', event.locals.settings.theme.mode)
							);
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
