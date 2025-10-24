import type { ThemeSettings } from './theme.js';
import type { BackgroundType, TaskbarPosition } from '../constants.js';
import { APP_CONSTANTS, DEFAULTS } from '../constants.js';

export interface BackgroundSettings {
	type: BackgroundType;
	value: string;
}

export interface UserSettings {
	windowPreview: boolean;
	screenshotThumbnailHeight: number;
	preferPerformance: boolean;
	background: BackgroundSettings;
	taskbarPosition: TaskbarPosition;
	theme: ThemeSettings;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
	windowPreview: true,
	screenshotThumbnailHeight: APP_CONSTANTS.DEFAULT_SCREENSHOT_HEIGHT,
	preferPerformance: false,
	background: DEFAULTS.BACKGROUND,
	taskbarPosition: DEFAULTS.TASKBAR.position,
	theme: DEFAULTS.THEME
};
