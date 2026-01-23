/**
 * Alkalmazás konstansok.
 * Központi helye az alkalmazásban használt konstansoknak.
 */

// Alkalmazás alapvető konstansok
export const APP_CONSTANTS = {
	// Alkalmazás információk
	APP_NAME: 'Desktop Environment',
	APP_VERSION: '1.0.0',
	APP_DESCRIPTION: 'Webes asztali környezet SvelteKit-tel',

	// Session és cookie konstansok
	SESSION_COOKIE_PREFIX: 'app',

	// Ablak konstansok
	MIN_WINDOW_WIDTH: 300,
	MIN_WINDOW_HEIGHT: 200,
	DEFAULT_WINDOW_WIDTH: 800,
	DEFAULT_WINDOW_HEIGHT: 600,

	// Taskbar konstansok
	TASKBAR_HEIGHT: 48,
	TASKBAR_POSITIONS: ['top', 'bottom', 'left', 'right'] as const,
	TASKBAR_STYLES: ['classic', 'modern'] as const,

	// Téma konstansok
	THEME_MODES: ['light', 'dark', 'auto'] as const,
	FONT_SIZES: ['small', 'medium', 'large'] as const,

	// Screenshot konstansok
	DEFAULT_SCREENSHOT_HEIGHT: 200,
	SCREENSHOT_QUALITY: 0.8,

	// Alkalmazás kategóriák
	APP_CATEGORIES: [
		'productivity',
		'system',
		'utilities',
		'entertainment',
		'development',
		'other'
	] as const,

	// Ikon típusok
	ICON_EXTENSIONS: {
		SVG: ['.svg'],
		IMAGE: ['.png', '.jpg', '.jpeg', '.gif', '.webp']
	},

	// Háttér típusok
	BACKGROUND_TYPES: ['color', 'image', 'video'] as const,

	// Animáció konstansok
	ANIMATION_DURATION: {
		FAST: 150,
		NORMAL: 300,
		SLOW: 500
	},

	// Z-index konstansok
	Z_INDEX: {
		DESKTOP: 0,
		WINDOW: 100,
		TASKBAR: 1000,
		START_MENU: 1100,
		MODAL: 2000,
		TOOLTIP: 3000
	}
} as const;

// Típus definíciók a konstansokhoz
export type TaskbarPosition = (typeof APP_CONSTANTS.TASKBAR_POSITIONS)[number];
export type TaskbarStyle = (typeof APP_CONSTANTS.TASKBAR_STYLES)[number];
export type ThemeMode = (typeof APP_CONSTANTS.THEME_MODES)[number];
export type FontSize = (typeof APP_CONSTANTS.FONT_SIZES)[number];
export type AppCategory = (typeof APP_CONSTANTS.APP_CATEGORIES)[number];
export type BackgroundType = (typeof APP_CONSTANTS.BACKGROUND_TYPES)[number];

// Alkalmazás útvonalak
export const APP_PATHS = {
	// Statikus eszközök
	STATIC_ICONS: '/icons',
	STATIC_IMAGES: '/images',
	STATIC_VIDEOS: '/videos',

	// Alkalmazás útvonalak
	APPS_BASE: '/src/lib/apps',
	COMPONENTS_BASE: '/src/lib/components',
	UTILS_BASE: '/src/lib/utils',
	TYPES_BASE: '/src/lib/types',

	// API útvonalak
	API_BASE: '/api',
	API_AUTH: '/api/auth',
	API_APPS: '/api/apps',
	API_SETTINGS: '/api/settings'
} as const;

// Hibaüzenetek
export const ERROR_MESSAGES = {
	APP_NOT_FOUND: 'Az alkalmazás nem található',
	APP_LOAD_FAILED: 'Az alkalmazás betöltése sikertelen',
	WINDOW_NOT_FOUND: 'Az ablak nem található',
	INVALID_WINDOW_SIZE: 'Érvénytelen ablak méret',
	SCREENSHOT_FAILED: 'A képernyőkép készítése sikertelen',
	ICON_LOAD_FAILED: 'Az ikon betöltése sikertelen',
	THEME_LOAD_FAILED: 'A téma betöltése sikertelen',
	SETTINGS_SAVE_FAILED: 'A beállítások mentése sikertelen'
} as const;

// Siker üzenetek
export const SUCCESS_MESSAGES = {
	APP_LOADED: 'Az alkalmazás sikeresen betöltve',
	SETTINGS_SAVED: 'A beállítások sikeresen mentve',
	THEME_CHANGED: 'A téma sikeresen megváltoztatva',
	SCREENSHOT_TAKEN: 'A képernyőkép sikeresen elkészítve'
} as const;

// Alapértelmezett értékek
export const DEFAULTS = {
	// Ablak alapértelmezett értékek
	WINDOW: {
		width: APP_CONSTANTS.DEFAULT_WINDOW_WIDTH,
		height: APP_CONSTANTS.DEFAULT_WINDOW_HEIGHT,
		resizable: true,
		maximizable: true,
		minimizable: true,
		multiInstance: false
	},

	// Téma alapértelmezett értékek
	THEME: {
		mode: 'dark' as ThemeMode,
		modeTaskbarStartMenu: 'dark' as ThemeMode,
		colorPrimaryHue: '225',
		fontSize: 'medium' as FontSize
	},

	// Háttér alapértelmezett értékek
	BACKGROUND: {
		type: 'video' as BackgroundType,
		value: 'bg-video.mp4'
	},

	// Taskbar alapértelmezett értékek
	TASKBAR: {
		position: 'bottom' as TaskbarPosition,
		height: APP_CONSTANTS.TASKBAR_HEIGHT,
		style: 'classic' as TaskbarStyle,
		itemVisibility: {
			clock: true,
			themeSwitcher: true,
			appGuidLink: true
		}
	}
} as const;
