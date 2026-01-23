import db from '$lib/server/database';
import { eq } from 'drizzle-orm';
import { users } from '$lib/server/database/schemas';
import type { UserSettings } from '$lib/types/settings';
import { DEFAULT_USER_SETTINGS } from '$lib/types/settings';
import type { UserSelectModel } from '$lib/server/database/schemas/auth/users/users';

export class UserRepository {
	/**
	 * Felhasználó lekérdezése ID alapján.
	 * @param id - A felhasználó ID-ja.
	 * @returns A felhasználó adatokat tartalmazó objektum.
	 */
	async findById(id: number): Promise<UserSelectModel | undefined> {
		const result = await db.query.users.findFirst({
			where: eq(users.id, id)
		});
		return result;
	}

	/**
	 * Felhasználó lekérdezése email alapján.
	 * @param email - Email cím.
	 * @returns A felhasználó adatokat tartalmazó objektum.
	 */
	async findByEmail(email: string): Promise<UserSelectModel | undefined> {
		const result = await db.query.users.findFirst({
			where: eq(users.email, email)
		});
		return result;
	}

	/**
	 * Felhasználói beállítások lekérdezése
	 * Ha nincs mentett beállítás, az alapértelmezett értékeket adja vissza
	 */
	async getUserSettings(userId: number): Promise<UserSettings> {
		const user = await this.findById(userId);

		if (!user || !user.userSettings) {
			return DEFAULT_USER_SETTINGS;
		}

		// Merge a mentett beállításokat az alapértelmezettekkel (ha hiányoznának mezők)
		return {
			...DEFAULT_USER_SETTINGS,
			...(user.userSettings as Partial<UserSettings>),
			background: {
				...DEFAULT_USER_SETTINGS.background,
				...((user.userSettings as Partial<UserSettings>)?.background || {})
			},
			theme: {
				...DEFAULT_USER_SETTINGS.theme,
				...((user.userSettings as Partial<UserSettings>)?.theme || {})
			},
			taskbar: {
				...DEFAULT_USER_SETTINGS.taskbar,
				...((user.userSettings as Partial<UserSettings>)?.taskbar || {}),
				itemVisibility: {
					...DEFAULT_USER_SETTINGS.taskbar.itemVisibility,
					...((user.userSettings as Partial<UserSettings>)?.taskbar?.itemVisibility || {})
				}
			}
		};
	}

	/**
	 * Felhasználói beállítások mentése
	 */
	async updateUserSettings(
		userId: number,
		settings: UserSettings
	): Promise<{ success: boolean; settings: UserSettings }> {
		await db
			.update(users)
			.set({
				userSettings: settings,
				updatedAt: new Date()
			})
			.where(eq(users.id, userId));

		return {
			success: true,
			settings
		};
	}

	/**
	 * Felhasználói beállítások részleges frissítése
	 */
	async patchUserSettings(
		userId: number,
		updates: Partial<UserSettings>
	): Promise<{ success: boolean; settings: UserSettings }> {
		// Először lekérjük a jelenlegi beállításokat
		const currentSettings = await this.getUserSettings(userId);

		// Merge az új beállításokkal
		const newSettings: UserSettings = {
			...currentSettings,
			...updates,
			background: {
				...currentSettings.background,
				...(updates.background || {})
			},
			theme: {
				...currentSettings.theme,
				...(updates.theme || {})
			},
			taskbar: {
				...currentSettings.taskbar,
				...(updates.taskbar || {}),
				itemVisibility: {
					...currentSettings.taskbar.itemVisibility,
					...(updates.taskbar?.itemVisibility || {})
				}
			}
		};

		// preferPerformance logika
		if (updates.preferPerformance === true) {
			newSettings.windowPreview = false;
		}

		// windowPreview csak akkor frissíthető, ha preferPerformance false
		if (updates.windowPreview !== undefined && !newSettings.preferPerformance) {
			newSettings.windowPreview = updates.windowPreview;
		}

		// screenshotThumbnailHeight csak akkor frissíthető, ha windowPreview true
		if (updates.screenshotThumbnailHeight !== undefined) {
			if (newSettings.windowPreview && !newSettings.preferPerformance) {
				newSettings.screenshotThumbnailHeight = updates.screenshotThumbnailHeight;
			}
		}

		return this.updateUserSettings(userId, newSettings);
	}

	/**
	 * Összes felhasználó lekérdezése
	 */
	async findAll(): Promise<UserSelectModel[]> {
		return db.query.users.findMany();
	}
}

// Singleton instance
export const userRepository = new UserRepository();
