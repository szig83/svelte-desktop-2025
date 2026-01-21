import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import type { UserSettings } from '$lib/types/settings';
import { APP_CONSTANTS } from '$lib/constants';

// Request validation schema
const updateSettingsSchema = v.object({
	preferPerformance: v.optional(v.boolean()),
	windowPreview: v.optional(v.boolean()),
	screenshotThumbnailHeight: v.optional(v.pipe(v.number(), v.minValue(100), v.maxValue(400))),
	background: v.optional(
		v.object({
			type: v.optional(v.picklist(['color', 'image', 'video'])),
			value: v.optional(v.string())
		})
	),
	theme: v.optional(
		v.object({
			mode: v.optional(v.picklist(['light', 'dark', 'auto'])),
			modeTaskbarStartMenu: v.optional(v.picklist(['light', 'dark', 'auto'])),
			colorPrimaryHue: v.optional(v.string()),
			fontSize: v.optional(v.picklist(['small', 'medium', 'large']))
		})
	)
});

/**
 * Frissíti a felhasználói beállításokat.
 * @param updates - A frissítendő beállítások.
 * @returns A frissített beállítások objektum.
 */
export const updateSettings = command(updateSettingsSchema, async (updates) => {
	const event = getRequestEvent();
	const { cookies, locals } = event;

	// Inicializáljuk a settings-et, ha még nincs
	if (!locals.settings) {
		locals.settings = {
			windowPreview: true,
			screenshotThumbnailHeight: APP_CONSTANTS.DEFAULT_SCREENSHOT_HEIGHT,
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
	}

	// Frissítjük a locals.settings objektumot
	if (updates.preferPerformance !== undefined) {
		locals.settings.preferPerformance = updates.preferPerformance;

		// Ha preferPerformance true, akkor windowPreview automatikusan false
		if (updates.preferPerformance) {
			locals.settings.windowPreview = false;
		}
	}

	if (updates.windowPreview !== undefined && !locals.settings.preferPerformance) {
		locals.settings.windowPreview = updates.windowPreview;
	}

	if (updates.screenshotThumbnailHeight !== undefined) {
		// Csak akkor frissítjük, ha windowPreview engedélyezve van
		if (locals.settings.windowPreview && !locals.settings.preferPerformance) {
			locals.settings.screenshotThumbnailHeight = updates.screenshotThumbnailHeight;
		}
	}

	// Háttér beállítások frissítése
	if (updates.background !== undefined) {
		locals.settings.background = {
			...locals.settings.background,
			...updates.background
		};
	}

	// Téma beállítások frissítése
	if (updates.theme !== undefined) {
		locals.settings.theme = {
			...locals.settings.theme,
			...updates.theme
		};
	}

	// Mentjük cookie-ban
	cookies.set('app.user_settings', JSON.stringify(locals.settings), {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 365 // 1 év
	});

	console.log('Settings updated:', locals.settings);

	return {
		success: true,
		settings: locals.settings as UserSettings
	};
});
