import { redirect, type Handle } from '@sveltejs/kit';
import { auth } from '$lib/auth/index';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
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

		// Effektív téma mód kiszámítása (auto esetén a rendszer beállítás alapján)
		let effectiveMode = event.locals.settings.theme.mode;
		if (effectiveMode === 'auto') {
			// SSR esetén nem tudjuk a kliens rendszer beállítását, alapértelmezett: dark
			effectiveMode = 'dark';
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
