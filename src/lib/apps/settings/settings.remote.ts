import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import type { UserSettings } from '$lib/types/settings';
import { DEFAULT_USER_SETTINGS } from '$lib/types/settings';
import { userRepository } from '$lib/server/database/repositories';

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
	const { locals } = event;

	// Ellenőrizzük, hogy be van-e jelentkezve a felhasználó
	if (!locals.user?.id) {
		return {
			success: false,
			error: 'User not authenticated',
			settings: locals.settings || DEFAULT_USER_SETTINGS
		};
	}

	const userId = parseInt(locals.user.id);

	// Adatbázisba mentjük a beállításokat a repository-n keresztül
	const result = await userRepository.patchUserSettings(userId, updates as Partial<UserSettings>);

	// Frissítjük a locals.settings-et is, hogy a jelenlegi request-ben is elérhető legyen
	locals.settings = result.settings;

	console.log('Settings updated:', result.settings);

	return result;
});
