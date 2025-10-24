/**
 * Alkalmazás regiszter konfigurációja
 * Itt definiáljuk az alapértelmezett alkalmazás beállításokat
 */

import type { AppMetadata, WindowSize } from './index.js';
import { APP_CONSTANTS } from '../../constants.js';

// Alapértelmezett ablak méretek
export const DEFAULT_WINDOW_SIZES: Record<string, WindowSize> = {
	small: { width: 400, height: 300 },
	medium: {
		width: APP_CONSTANTS.DEFAULT_WINDOW_WIDTH,
		height: APP_CONSTANTS.DEFAULT_WINDOW_HEIGHT
	},
	large: { width: 1200, height: 800 },
	fullscreen: { width: 1920, height: 1080 }
};

// Alapértelmezett minimális ablak méret
export const MIN_WINDOW_SIZE: WindowSize = {
	width: APP_CONSTANTS.MIN_WINDOW_WIDTH,
	height: APP_CONSTANTS.MIN_WINDOW_HEIGHT
};

/**
 * Alapértelmezett alkalmazás metaadatok létrehozása
 */
export function createDefaultAppMetadata(
	id: string,
	name: string,
	overrides: Partial<AppMetadata> = {}
): AppMetadata {
	return {
		id,
		name,
		description: `${name} alkalmazás`,
		version: '1.0.0',
		icon: `/icons/${id}.svg`,
		category: 'other',
		permissions: [],
		multiInstance: false,
		defaultSize: DEFAULT_WINDOW_SIZES.medium,
		minSize: MIN_WINDOW_SIZE,
		...overrides
	};
}

/**
 * Alkalmazás sablon struktúra validálása
 */
export function validateAppStructure(appId: string): boolean {
	// Itt ellenőrizhetjük, hogy az alkalmazás megfelelő struktúrával rendelkezik-e
	// Jelenleg egyszerű implementáció, később bővíthető
	return typeof appId === 'string' && appId.length > 0;
}
